import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FiArrowLeft, FiHome, FiSave, FiClock, FiMessageSquare } from 'react-icons/fi';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel,
  useStore
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

// Custom Nodes
import StartingPointNode from './nodes/StartingPointNode';
import NoteNode from './nodes/NoteNode';
import AiNode from './nodes/AiNode';
import AiAgentNode from './nodes/AiAgentNode';
import TerminalNode from './nodes/TerminalNode';
import Sidebar from './components/Sidebar';
import HistorySidebar from './components/HistorySidebar';
import WorkflowControls from './components/WorkflowControls';

// Hooks & Services
import { useWorkflowSocket } from '../../hooks/useWorkflowSocket';
import workflowService from '../../services/workflow.service';

const nodeTypes = {
  startingPoint: StartingPointNode,
  note: NoteNode,
  ai: AiNode,
  agent: AiAgentNode,
  terminal: TerminalNode,
};

const InteractiveBackground = () => {
  const transform = useStore((s) => s.transform);
  const [x, y] = transform;

  return (
    <>
      {/* Base dots: Brighter static green, unscalable, only pans */}
      <div
        className="absolute inset-0 pointer-events-none bg-transparent"
        style={{
          zIndex: 0,
          backgroundPosition: `${x}px ${y}px`,
          backgroundImage: 'radial-gradient(rgba(0, 255, 65, 0.3) 1px, transparent 1.2px)',
          backgroundSize: '20px 20px'
        }}
      />
      {/* Hover dots: Maximum neon glow brightness, slightly larger dot diameter (1.5px) */}
      <div
        className="absolute inset-0 pointer-events-none bg-transparent"
        style={{
          zIndex: 0,
          backgroundPosition: `${x}px ${y}px`,
          backgroundImage: 'radial-gradient(rgba(200, 255, 220, 1) 1.5px, transparent 2px)',
          backgroundSize: '20px 20px',
          maskImage: 'radial-gradient(140px circle at var(--mouse-x, -1000px) var(--mouse-y, -1000px), black 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(140px circle at var(--mouse-x, -1000px) var(--mouse-y, -1000px), black 0%, transparent 100%)',
        }}
      />
    </>
  );
};

const WorkflowEditor = ({ workflowId: propWorkflowId, pentestId: propPentestId }) => {
  const params = useParams();
  const navigate = useNavigate();
  const workflowId = propWorkflowId || params.workflowId || "mock-id-123";
  const pentestId = propPentestId || params.pentestId;

  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [lastSaved, setLastSaved] = useState(new Date());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  const [findings, setFindings] = useState([]);
  const [projectInfo, setProjectInfo] = useState({ name: 'Untitled Workflow', type: 'Audit' });

  const {
    socket,
    collaborators,
    cursors,
    activeNodes,
    nodes: remoteNodes,
    edges: remoteEdges,
    emitWorkflowChange,
    emitCursorMove,
    emitNodeFocus,
    user: localUser
  } = useWorkflowSocket(workflowId);

  // Local React Flow State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Sync Remote Changes into Local State
  useEffect(() => {
    if (remoteNodes && remoteNodes.length > 0) {
      // We need to inject the onDelete handler into remote nodes since they come from network without functions
      const nodesWithHandlers = remoteNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onDelete: () => deleteNode(node.id),
          onTitleChange: (newTitle) => updateNodeTitle(node.id, newTitle),
          onLinkFinding: (findingId) => linkFinding(node.id, findingId),
          findings,
          activeUsers: activeNodes[node.id] || {}
        }
      }));
      setNodes(nodesWithHandlers);
    }
    if (remoteEdges && remoteEdges.length > 0) setEdges(remoteEdges);
  }, [remoteNodes, remoteEdges, setNodes, setEdges]);

  // Load Initial Graph State
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const data = await workflowService.getWorkflowById(workflowId);
        if (data && data.nodes) {
          const nodesWithHandlers = data.nodes.map(node => ({
            ...node,
            data: {
              ...node.data,
              onDelete: () => deleteNode(node.id),
              onTitleChange: (newTitle) => updateNodeTitle(node.id, newTitle),
              onLinkFinding: (findingId) => linkFinding(node.id, findingId),
              findings: data.pentest?.findings || [],
              activeUsers: activeNodes[node.id] || {}
            }
          }));
          setNodes(nodesWithHandlers);
        }
        if (data && data.edges) setEdges(data.edges);
        if (data && data.pentest?.findings) setFindings(data.pentest.findings);
        if (data) {
          setProjectInfo({
            name: data.name || data.title || data.pentest?.name || data.pentest?.title || 'Untitled Workflow',
            type: data.pentest?.type || 'Audit'
          });
        }

        // RBAC Check
        const collaborators = data.pentest?.collaborators || [];
        const isCollaborator = collaborators.some(c =>
          c.userId === localUser.id &&
          ["HACKER", "PROJECT_ADMIN", "ORG_ADMIN"].includes(c.role)
        );
        const isSuperAdmin = localUser.roles?.some(r => r.type === "SUPER_ADMIN");

        if (!isCollaborator && !isSuperAdmin) {
          setCanEdit(false);
          setIsLocked(true);
        }
      } catch (err) {
        console.error("Failed to load workflow data", err);
      }
    };
    fetchInitialData();
  }, [workflowId, setNodes, setEdges]);

  // Helper to save structural changes to DB History
  const saveToDatabase = async (currentNodes, currentEdges, action = "GRAPH_CHANGED", meta = {}) => {
    try {
      await workflowService.updateWorkflow(workflowId, { nodes: currentNodes, edges: currentEdges });
      await workflowService.recordWorkflowHistory(workflowId, {
        action,
        details: {
          nodesCount: currentNodes.length,
          edgesCount: currentEdges.length,
          ...meta
        }
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error("Failed to save changes", err);
    }
  };

  // Delete Node Handler
  const deleteNode = useCallback((id) => {
    setNodes((nds) => {
      const newNodes = nds.filter((node) => node.id !== id);
      setEdges((eds) => {
        const newEdges = eds.filter((edge) => edge.source !== id && edge.target !== id);

        // Broadcast change
        setTimeout(() => {
          emitWorkflowChange(newNodes, newEdges);
          saveToDatabase(newNodes, newEdges, "DELETE_NODE", { nodeId: id });
        }, 50);

        return newEdges;
      });
      return newNodes;
    });
  }, [emitWorkflowChange, setNodes, setEdges]);

  // Core Add Node Function
  const addNode = useCallback((type, position) => {
    const id = `${type}-${Date.now()}`;
    const newNode = {
      id,
      type,
      position,
      data: {
        label: '',
        onDelete: () => deleteNode(id),
        onTitleChange: (newTitle) => updateNodeTitle(id, newTitle),
        activeUsers: {}
      },
    };

    setNodes((nds) => {
      const newNodes = [...nds, newNode];
      setEdges((eds) => {
        emitWorkflowChange(newNodes, eds);
        saveToDatabase(newNodes, eds, "ADD_NODE", { type });
        return eds;
      });
      return newNodes;
    });
  }, [emitWorkflowChange, deleteNode]);

  const addNodeByClick = (type) => {
    // Add to center of view
    const position = { x: 250, y: 250 };
    addNode(type, position);
  };

  // Update Node Title Handler
  const updateNodeTitle = useCallback((id, newTitle) => {
    setNodes((nds) => {
      const newNodes = nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              label: newTitle,
            },
          };
        }
        return node;
      });

      setEdges((eds) => {
        emitWorkflowChange(newNodes, eds);
        saveToDatabase(newNodes, eds, "UPDATE_TITLE", { nodeId: id, newTitle });
        return eds;
      });

      return newNodes;
    });
  }, [emitWorkflowChange, setNodes, setEdges]);

  const linkFinding = useCallback((id, findingId) => {
    setNodes((nds) => {
      const newNodes = nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              findingId,
            },
          };
        }
        return node;
      });

      setEdges((eds) => {
        emitWorkflowChange(newNodes, eds);
        saveToDatabase(newNodes, eds, "LINK_FINDING", { nodeId: id, findingId });
        return eds;
      });

      return newNodes;
    });
  }, [emitWorkflowChange, setNodes, setEdges]);

  // Handle Connecting Nodes
  const onConnect = useCallback(
    (params) => {
      const newEdges = addEdge({ ...params, animated: true, style: { stroke: '#00ff41', strokeWidth: 1.5 } }, edges);
      setEdges(newEdges);
      emitWorkflowChange(nodes, newEdges);
      saveToDatabase(nodes, newEdges, "CONNECT_NODES");
    },
    [edges, nodes, setEdges, emitWorkflowChange]
  );

  // Handle Drag & Drop Node Creation
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [reactFlowInstance, addNode]
  );

  // General Change Handler (Moving, editing nodes)
  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);

    // Only emit/save if it represents a structural change or move end, to avoid spanmung
    const dragEndedOrDeleted = changes.some(c => (c.type === "position" && !c.dragging) || c.type === "remove");
    if (dragEndedOrDeleted) {
       setTimeout(() => {
         // A small closure-like check to get the latest state
         setNodes((nds) => {
           setEdges((eds) => {
             emitWorkflowChange(nds, eds);
             const isDelete = changes.some(c => c.type === "remove");
             if (!isDelete) {
               saveToDatabase(nds, eds, "MOVE_NODE");
             }
             return eds;
           });
           return nds;
         });
       }, 50);
    }
  }, [onNodesChange, emitWorkflowChange, setNodes, setEdges]);

  // Sync activeNodes to node data
  useEffect(() => {
    setNodes((nds) =>
      nds.map(node => ({
        ...node,
        data: {
          ...node.data,
          activeUsers: activeNodes[node.id] || {}
        }
      }))
    );
  }, [activeNodes, setNodes]);

  const onSelectionChange = useCallback(({ nodes: selectedNodes }) => {
    const mainNode = selectedNodes[0];
    if (mainNode) {
      emitNodeFocus(mainNode.id, localUser.name, localUser.color);
    } else {
      emitNodeFocus(null, localUser.name, localUser.color);
    }
  }, [emitNodeFocus, localUser]);

  // Render Remote Cursors
  const renderCursors = () => {
    return Object.entries(cursors).map(([socketId, cursor]) => (
      <div
        key={socketId}
        className="absolute pointer-events-none z-50 flex items-center gap-2 transition-transform duration-100 ease-out"
        style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0.999967 0L6.64997 15.5L8.54997 9.5L14.45 7.6L0.999967 0Z" fill={cursor.color || "#00ff41"}/>
        </svg>
        <span className="text-black text-[10px] px-1.5 py-0.5 rounded font-bold shadow-sm"
              style={{ backgroundColor: cursor.color || "#00ff41" }}>
          {cursor.user || 'Peer'}
        </span>
      </div>
    ));
  };

  return (
    <div className="flex flex-col h-screen bg-[#13151a] text-white overflow-hidden relative">
      {/* Top Header Bar */}
      <div className="h-14 border-b border-[#252830] flex items-center justify-between px-4 bg-[#1a1c23]/90 backdrop-blur-md z-20 shadow-sm relative">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white flex items-center gap-2 justify-center text-xs font-semibold uppercase tracking-wider transition-colors"
            title="Back to Dashboard"
          >
            <FiArrowLeft size={18} />
            <FiHome size={16} />
            Dashboard
          </button>
          <div className="font-semibold font-sans text-xs uppercase tracking-widest text-[#00ff41] bg-[#00ff41]/10 border border-[#00ff41]/20 px-2.5 py-1 rounded-md">{projectInfo.type} Workflow</div>
          <div className="font-semibold font-sans text-sm max-w-[200px] truncate text-white" title={projectInfo.name}>{projectInfo.name}</div>
          <div className="text-gray-400 text-[10px] font-medium flex items-center gap-1.5 bg-[#13151a] px-2.5 py-1.5 rounded-full border border-[#252830] shadow-sm">
            <FiSave size={12} className="text-[#00ff41]" />
            SYNCED: {formatDistanceToNow(lastSaved, { addSuffix: true })}
          </div>
        </div>

        <div className="flex items-center gap-4">
            {/* Active Collaborators Profiles */}
            <div className="flex -space-x-2 items-center">
               {Object.values(collaborators).map((collab, index) => (
                 <div
                   key={collab.id}
                   className="relative group transition-transform hover:-translate-y-1 hover:z-30 cursor-help"
                   style={{ zIndex: 10 + index }}
                   title={collab.user || 'Online Hacker'}
                >
                   <div
                     className="w-8 h-8 rounded-full border-2 border-[#1a1c23] flex items-center justify-center text-xs font-bold shadow-md bg-[#13151a]"
                     style={{ backgroundColor: collab.color || '#00ff41', color: '#000' }}
                   >
                     {collab.user?.[0]?.toUpperCase() || 'H'}
                   </div>
                   <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00ff41] border-[1.5px] border-[#1a1c23] rounded-full shadow-[0_0_5px_rgba(0,255,65,0.4)]"></span>
                 </div>
               ))}
            </div>

           <div className="h-6 w-px bg-gray-700 mx-1"></div>

           <button
             className={`hover:text-[#00ff41] transition-colors flex items-center gap-2 font-semibold text-xs ${isHistoryOpen ? 'text-[#00ff41]' : 'text-gray-400'}`}
             title="History"
             onClick={() => setIsHistoryOpen(!isHistoryOpen)}
           >
             <FiClock size={16} />
             <span>HISTORY</span>
           </button>
           <button className="text-gray-400 hover:text-[#00ff41] transition-colors" title="Comments">
             <FiMessageSquare size={16} />
           </button>
           <button className="bg-[#00ff41] hover:bg-[#00cc33] text-black px-4 py-1.5 rounded-md text-xs font-bold transition-all shadow-[0_0_10px_rgba(0,255,65,0.2)] active:scale-95">
              PUBLISH
           </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative"
           onMouseMove={(e) => {
             emitCursorMove(e.clientX, e.clientY, localUser.name);
             if (reactFlowWrapper.current) {
               const rect = reactFlowWrapper.current.getBoundingClientRect();
               reactFlowWrapper.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
               reactFlowWrapper.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
             }
           }}
           onMouseLeave={() => {
             if (reactFlowWrapper.current) {
               reactFlowWrapper.current.style.setProperty('--mouse-x', `-1000px`);
               reactFlowWrapper.current.style.setProperty('--mouse-y', `-1000px`);
             }
           }}>

        <Sidebar onAdd={addNodeByClick} />

        {renderCursors()}

        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onSelectionChange={onSelectionChange}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={{
                animated: true,
                style: { stroke: '#00ff41', strokeWidth: 1.5, opacity: 0.6 }
              }}
              fitView
              className="bg-transparent"
              nodesDraggable={!isLocked}
              nodesConnectable={!isLocked}
              elementsSelectable={!isLocked}
              panOnDrag={!isLocked}
            >
              <InteractiveBackground />
              <Panel position="bottom-left">
                <WorkflowControls
                  isLocked={isLocked}
                  onToggleLock={() => canEdit && setIsLocked(!isLocked)}
                  disabled={!canEdit}
                />
              </Panel>
              <MiniMap
                nodeColor={(n) => {
                  if (n.type === 'startingPoint') return '#00ff41';
                  if (n.type === 'ai') return '#00a3ff';
                  if (n.type === 'agent') return '#d000ff';
                  if (n.type === 'note') return '#ff7a00';
                  if (n.type === 'terminal') return '#ffb000';
                  return '#333';
                }}
                maskColor="rgba(19, 21, 26, 0.7)"
                activeColor="#00ff41"
                className="bg-[#1a1c23] border border-[#252830] rounded-lg overflow-hidden shadow-2xl scale-75 origin-bottom-right"
                style={{ bottom: 10, right: 10 }}
              />
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        <HistorySidebar
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          workflowId={workflowId}
        />
      </div>
    </div>
  );
};


export default WorkflowEditor;
