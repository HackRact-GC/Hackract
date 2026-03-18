import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FiArrowLeft, FiSave, FiClock, FiMessageSquare } from 'react-icons/fi';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { formatDistanceToNow } from 'date-fns';

// Custom Nodes
import StartingPointNode from './nodes/StartingPointNode';
import NoteNode from './nodes/NoteNode';
import AiNode from './nodes/AiNode';
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
  terminal: TerminalNode,
};

const WorkflowEditor = ({ workflowId = "mock-id-123", pentestId }) => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [lastSaved, setLastSaved] = useState(new Date());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

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
              activeUsers: activeNodes[node.id] || {}
            }
          }));
          setNodes(nodesWithHandlers);
        }
        if (data && data.edges) setEdges(data.edges);
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

  // Handle Connecting Nodes
  const onConnect = useCallback(
    (params) => {
      const newEdges = addEdge(params, edges);
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
          <path d="M0.999967 0L6.64997 15.5L8.54997 9.5L14.45 7.6L0.999967 0Z" fill="#00ff41"/>
        </svg>
        <span className="bg-[#00ff41] text-black text-[10px] px-1 rounded font-bold">
          {cursor.user || 'Peer'}
        </span>
      </div>
    ));
  };


  return (
    <div className="flex flex-col h-screen bg-[#07090e] text-white overflow-hidden">
      {/* Top Header Bar */}
      <div className="h-14 border-b border-gray-800 flex items-center justify-between px-4 bg-[#0b0f19] z-20">
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-white flex items-center justify-center">
            <FiArrowLeft size={18} />
          </button>
          <div className="font-bold font-mono text-xs uppercase tracking-widest text-[#00ff41]">Audit Workflow</div>
          <div className="font-bold font-mono max-w-[200px] truncate">E-Commerce Security Audit...</div>
          <div className="text-gray-500 text-[10px] font-mono flex items-center gap-1 bg-black/30 px-2 py-1 rounded border border-gray-800">
            <FiSave size={12} className="text-[#00ff41]" />
            SYNCED: {formatDistanceToNow(lastSaved, { addSuffix: true })}
          </div>
        </div>

        <div className="flex items-center gap-3">
            {/* Active Collaborators Bubbles */}
            <div className="flex -space-x-2 items-center">
               {Object.values(collaborators).map((collab, index) => (
                 <div
                   key={collab.id}
                   className="w-8 h-8 rounded-full border-2 border-[#0b0f19] flex items-center justify-center text-xs font-bold shadow-lg transition-transform hover:-translate-y-1 hover:z-30 cursor-help"
                   style={{ backgroundColor: collab.color || '#00ff41', color: '#fff', zIndex: 10 + index }}
                   title={collab.user}
                >
                   {collab.user?.[0] || 'U'}
                 </div>
               ))}
            </div>

           <div className="h-6 w-px bg-gray-700 mx-2"></div>

           <button
             className={`hover:text-white transition-colors flex items-center gap-2 font-mono text-xs ${isHistoryOpen ? 'text-[#00a3ff]' : 'text-gray-400'}`}
             title="History"
             onClick={() => setIsHistoryOpen(!isHistoryOpen)}
           >
             <FiClock size={16} />
             <span>LOGS</span>
           </button>
           <button className="text-gray-400 hover:text-white" title="Comments">
             <FiMessageSquare size={16} />
           </button>
           <button className="bg-[#00a3ff] hover:bg-[#0082cc] text-white px-4 py-1.5 rounded text-xs font-mono font-bold transition-all shadow-[0_0_10px_rgba(0,163,255,0.4)] active:scale-95">
              PUBLISH
           </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative"
           onMouseMove={(e) => emitCursorMove(e.clientX, e.clientY, localUser.name)}>

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
              fitView
              className="bg-[#07090e]"
              nodesDraggable={!isLocked}
              nodesConnectable={!isLocked}
              elementsSelectable={!isLocked}
              panOnDrag={!isLocked}
            >
              <Background
                variant="lines"
                color="rgba(0, 255, 65, 0.15)"
                gap={40}
                className="bg-[#07090e]"
              />
              <Panel position="bottom-left">
                <WorkflowControls isLocked={isLocked} onToggleLock={() => setIsLocked(!isLocked)} />
              </Panel>
              <MiniMap
                nodeColor={(n) => {
                  if (n.type === 'startingPoint') return '#00ff41';
                  if (n.type === 'ai') return '#00a3ff';
                  if (n.type === 'note') return '#ff7a00';
                  if (n.type === 'terminal') return '#ffb000';
                  return '#333';
                }}
                maskColor="rgba(0, 0,0, 0.6)"
                activeColor="#00ff41"
                className="bg-[#0b0f19] border border-[#00ff41]/20 rounded-lg overflow-hidden shadow-2xl scale-75 origin-bottom-right"
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
