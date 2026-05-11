import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FiArrowLeft, FiHome, FiSave, FiClock, FiMessageSquare, FiExternalLink } from 'react-icons/fi';
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
import { useAuth } from '../../context/authContext.jsx';
import api from "../../api/axiosConfig";

const nodeTypes = {
  startingPoint: StartingPointNode,
  note: NoteNode,
  ai: AiNode,
  agent: AiAgentNode,
  terminal: TerminalNode,
};

const NODE_TYPE_LABELS = {
  startingPoint: 'Starting Point',
  note: 'Note',
  ai: 'AI',
  agent: 'AI Agent',
  terminal: 'Terminal',
};

const buildMessage = (action, details = {}) => {
  const hasLabel = typeof details.label === 'string' && details.label.trim().length > 0;
  const hasType = typeof details.type === 'string' && details.type.length > 0;
  const hasConnectionLabels = details.sourceLabel || details.targetLabel;

  const nodeLabelByType = hasType ? `a ${NODE_TYPE_LABELS[details.type] || details.type} node` : 'a node';
  const nodeLabel = hasLabel ? `"${details.label.trim()}"` : nodeLabelByType;
  const sourceLabel = details.sourceLabel || details.source || 'source';
  const targetLabel = details.targetLabel || details.target || 'target';

  const messages = {
    ADD_NODE:       hasLabel ? `Added node ${nodeLabel}` : `Added ${nodeLabel}`,
    DELETE_NODE:    hasLabel ? `Deleted node ${nodeLabel}` : `Deleted ${nodeLabel}`,
    MOVE_NODE:      `Moved ${nodeLabel}`,
    UPDATE_TITLE:   `Renamed node to "${details.newTitle || 'Untitled'}"`,
    CONNECT_NODES:  details.source && details.target ? `Connected ${hasConnectionLabels ? `"${sourceLabel}" to "${targetLabel}"` : 'two nodes'}` : `Connected two nodes`,
    DELETE_EDGE:    `Removed a connection`,
    LINK_FINDING:   `Linked finding to ${nodeLabel}`,
    GRAPH_CHANGED:  `Updated the canvas`,
    AGENT_RAN:      `Ran the "${details.agentName || 'AI'}" agent`,
    TERMINAL_EXEC:  `Executed command in Terminal`,
  };

  return messages[action] || action.replace(/_/g, ' ').toLowerCase();
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

const WorkflowEditor = ({ workflowId: propWorkflowId }) => {
  const params = useParams();
  const navigate = useNavigate();
  const workflowId = propWorkflowId || params.workflowId || "mock-id-123";

  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [lastSaved, setLastSaved] = useState(new Date());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  const [findings, setFindings] = useState([]);
  const [projectInfo, setProjectInfo] = useState({ name: null, type: 'Audit' }); // null = loading

  const {
    socket,
    collaborators,
    cursors,
    activeNodes,
    remotePatch,
    liveHistoryEvents,
    consumeRemotePatch,
    emitWorkflowChange,
    emitCursorMove,
    emitNodeFocus,
    emitHistoryEvent,
    user: localUser
  } = useWorkflowSocket(workflowId);

  // Track whether we are locally dragging so we don't overwrite positions mid-drag
  const isDraggingRef = useRef(false);

  const { user: authUser } = useAuth();

  // Local React Flow State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // ── Merge remote patches without disrupting local drag state ──────────────
  useEffect(() => {
    if (!remotePatch) return;
    const patch = consumeRemotePatch();
    if (!patch) return;

    // ── Node positions: merge by ID, never replace while locally dragging ────
    if (patch.nodes && patch.nodes.length > 0) {
      setNodes(localNodes => {
        // Build a fast lookup: patchedNodeId → { position, data fields }
        const patchMap = {};
        patch.nodes.forEach(n => { patchMap[n.id] = n; });

        const merged = localNodes.map(localNode => {
          const remote = patchMap[localNode.id];
          if (!remote) return localNode; // node not in patch → untouched

          // Skip position merge if user is currently dragging this node
          const isBeingDragged = isDraggingRef.current && localNode.dragging;
          const nextPosition = isBeingDragged ? localNode.position : (remote.position || localNode.position);

          return {
            ...localNode,
            position: nextPosition,
            // Merge remote data fields (label, findingId, etc.) but keep local callbacks
            data: {
              ...localNode.data,
              ...remote.data,
              // Always preserve local function callbacks — they cannot serialise over the socket
              onDelete: localNode.data.onDelete,
              onTitleChange: localNode.data.onTitleChange,
              onLinkFinding: localNode.data.onLinkFinding,
              findings: localNode.data.findings,
              activeUsers: activeNodes[localNode.id] || {},
            },
          };
        });

        // Handle new nodes added by a remote peer (not present locally)
        const localIds = new Set(localNodes.map(n => n.id));
        patch.nodes.forEach(remoteNode => {
          if (!localIds.has(remoteNode.id)) {
            // New node from remote — attach all local callbacks
            merged.push({
              ...remoteNode,
              data: {
                ...remoteNode.data,
                onDelete: () => deleteNode(remoteNode.id),
                onTitleChange: (newTitle) => updateNodeTitle(remoteNode.id, newTitle),
                onLinkFinding: (findingId) => linkFinding(remoteNode.id, findingId),
                findings,
                activeUsers: activeNodes[remoteNode.id] || {},
              },
            });
          }
        });

        // Handle nodes deleted by a remote peer
        if (patch.deletedNodeIds && patch.deletedNodeIds.length > 0) {
          const deletedSet = new Set(patch.deletedNodeIds);
          return merged.filter(n => !deletedSet.has(n.id));
        }

        return merged;
      });
    }

    // ── Edges: full replace is safe (edges have no callback functions) ────────
    if (patch.edges) {
      setEdges(patch.edges);
    }
  }, [remotePatch]); // eslint-disable-line react-hooks/exhaustive-deps

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
          // Try to determine project name from workflow name or pentest relation
          let projectName = data.pentest?.name;
          let projectType = data.pentest?.status || 'ACTIVE';

          // Robust Fallback: If pentest relation is empty but ID exists, fetch it specifically
          if (!projectName && data.pentestId) {
            try {
              const pRes = await api.get(`/projects/${data.pentestId}`);
              if (pRes.data?.success && pRes.data.data) {
                projectName = pRes.data.data.name;
                projectType = pRes.data.data.status;
              }
            } catch (pErr) {
              console.warn("Could not find parent project name via API", pErr);
            }
          }

          // Fallback: use workflow's own name only if it's not the generic default
          if (!projectName) {
            const storedName = data.name || data.title;
            if (storedName && storedName !== 'Untitled Workflow') {
              projectName = storedName;
            }
          }

          // If we resolved a real name and the DB still has the generic name, backfill it silently
          if (projectName && (data.name === 'Untitled Workflow' || !data.name)) {
            try {
              await workflowService.updateWorkflow(workflowId, { name: projectName });
            } catch { /* non-critical, ignore */ }
          }

          setProjectInfo({
            name: projectName || 'Mission Operational Workspace', 
            type: projectType
          });
        }

        // RBAC Check
        const pentestCollabs = data.pentest?.collaborators || [];
        const isCollaborator = pentestCollabs.some(c =>
          c.userId === localUser.id &&
          ["HACKER", "PROJECT_ADMIN", "ORG_ADMIN"].includes(c.role)
        );
        const isOrgAdmin = authUser?.roles?.some(r => r.type === "ORG_ADMIN");

        if (!isCollaborator && !isOrgAdmin) {
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
    const tempId = `temp-${Date.now()}`;
    const message = buildMessage(action, meta);
    const details = {
      nodesCount: currentNodes.length,
      edgesCount: currentEdges.length,
      ...meta
    };

    // 1. Optimistic Update: Emit temporary record immediately
    const optimisticRecord = {
      id: tempId,
      action,
      message,
      details,
      createdAt: new Date().toISOString(),
      userId: localUser.id,
      user: { fullName: localUser.name, id: localUser.id },
      isOptimistic: true // marker for debug/styles
    };
    
    console.log('[HISTORY][OPTIMISTIC]', optimisticRecord);
    emitHistoryEvent(optimisticRecord);

    try {
      // 2. Persist to DB
      await workflowService.updateWorkflow(workflowId, { nodes: currentNodes, edges: currentEdges });
      const record = await workflowService.recordWorkflowHistory(workflowId, {
        action,
        message,
        details
      });

      if (record) {
        console.log('[HISTORY][SERVER_SYNC]', record.id);
        // We don't necessarily need to replace the optimistic record if the socket handles deduplication by ID,
        // but since the server generated a REAL ID, we emit the real one to peers.
        const eventRecord = {
          ...record,
          userId: record.userId || localUser.id,
          user: { fullName: localUser.name, id: localUser.id }
        };
        emitHistoryEvent(eventRecord, tempId); // Replace optimistic entry with real one
      }

      setLastSaved(new Date());
    } catch (err) {
      console.error("[HISTORY][ERROR] Failed to save changes", err);
      toast.error("Cloud sync failed. History may be delayed.");
    }
  };

  // Delete Node Handler
  const deleteNode = useCallback((id) => {
    setNodes((nds) => {
      const deletedNode = nds.find(n => n.id === id);
      const newNodes = nds.filter((node) => node.id !== id);
      
      setEdges((eds) => {
        const newEdges = eds.filter((edge) => edge.source !== id && edge.target !== id);

        // Broadcast change
        setTimeout(() => {
          emitWorkflowChange(newNodes, newEdges);
          saveToDatabase(newNodes, newEdges, "DELETE_NODE", { 
            nodeId: id, 
            type: deletedNode?.type, 
            label: deletedNode?.data?.label 
          });
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
        saveToDatabase(newNodes, eds, "ADD_NODE", { type, label: '' });
        return eds;
      });
      return newNodes;
    });
  }, [emitWorkflowChange, deleteNode, setNodes, setEdges]);

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
      const sourceNode = nodes.find(node => node.id === params.source);
      const targetNode = nodes.find(node => node.id === params.target);
      const sourceLabel = sourceNode?.data?.label?.trim() || NODE_TYPE_LABELS[sourceNode?.type] || params.source;
      const targetLabel = targetNode?.data?.label?.trim() || NODE_TYPE_LABELS[targetNode?.type] || params.target;

      setEdges(newEdges);
      emitWorkflowChange(nodes, newEdges);
      saveToDatabase(nodes, newEdges, "CONNECT_NODES", {
        source: params.source,
        target: params.target,
        sourceLabel,
        targetLabel
      });
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

    const hasPositionChange = changes.some(c => c.type === 'position');
    const isDraggingNow = changes.some(c => c.type === 'position' && c.dragging === true);
    const dragEnded = changes.some(c => c.type === 'position' && c.dragging === false);
    const hasRemoval = changes.some(c => c.type === 'remove');

    // Update drag-in-progress ref so remote patches skip position merge
    if (isDraggingNow) isDraggingRef.current = true;
    if (dragEnded || hasRemoval) isDraggingRef.current = false;

    if (hasPositionChange || hasRemoval) {
      // For removals, capture metadata BEFORE state update
      let removalMeta = null;
      if (hasRemoval) {
        const removedChange = changes.find(c => c.type === 'remove');
        const node = nodes.find(n => n.id === removedChange.id);
        if (node) {
          removalMeta = { 
            nodeId: node.id, 
            type: node.type, 
            label: node.data?.label || node.id 
          };
          console.log('[HISTORY][TRACE] Capturing removal metadata:', removalMeta);
        }
      }

      // Use a micro-delay so React Flow finishes applying the change to state first
      setTimeout(() => {
        setNodes(nds => {
          setEdges(eds => {
            // Broadcast live position to peers (throttling is handled by socket.io itself)
            emitWorkflowChange(nds, eds);

            // Only persist to DB on drag-end or deletion
            if (dragEnded) {
              console.log('[HISTORY][TRACE] Persisting MOVE_NODE');
              saveToDatabase(nds, eds, 'MOVE_NODE');
            }
            if (hasRemoval) {
              console.log('[HISTORY][TRACE] Persisting DELETE_NODE with meta:', removalMeta);
              saveToDatabase(nds, eds, 'DELETE_NODE', removalMeta);
            }

            return eds;
          });
          return nds;
        });
      }, 8);
    }
  }, [onNodesChange, emitWorkflowChange, setNodes, setEdges, reactFlowInstance]);

  // Handle Edge Deletions dynamically so all peers see the disconnect
  const handleEdgesChange = useCallback((changes) => {
    onEdgesChange(changes);

    const isDelete = changes.some(c => c.type === "remove");
    if (isDelete) {
       setTimeout(() => {
         setNodes((nds) => {
           setEdges((eds) => {
             emitWorkflowChange(nds, eds);
             saveToDatabase(nds, eds, "DELETE_EDGE");
             return eds;
           });
           return nds;
         });
       }, 50);
    }
  }, [onEdgesChange, emitWorkflowChange, setNodes, setEdges]);

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

  // Render Remote Cursors — each with the peer's unique color
  const renderCursors = () => {
    return Object.entries(cursors).map(([socketId, cursor]) => {
      const color = cursor.color || '#00ff41';
      return (
        <div
          key={socketId}
          className="absolute pointer-events-none z-50 flex items-center gap-1.5"
          style={{
            transform: `translate(${cursor.x}px, ${cursor.y}px)`,
            transition: 'transform 80ms linear',
          }}
        >
          {/* Cursor arrow */}
          <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L0 14L3.5 10.5L6 16L8 15L5.5 9.5H10L0 0Z" fill={color} />
          </svg>
          {/* Name tag */}
          <span
            className="text-[10px] px-2 py-0.5 rounded font-bold shadow-lg whitespace-nowrap"
            style={{ backgroundColor: color, color: '#000' }}
          >
            {cursor.user || 'Peer'}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-screen bg-[#13151a] text-white overflow-hidden relative">
      {/* Top Header Bar */}
      <div className="h-14 border-b border-[#252830] flex items-center justify-between px-4 bg-[#1a1c23]/90 backdrop-blur-md z-20 shadow-sm relative">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const isOrg = authUser?.roles?.some(r => ['ORG_ADMIN', 'ORGANIZATION'].includes(r.type));
              navigate(isOrg ? '/dashboard' : '/hacker-dashboard');
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-[#00ff41] hover:border-[#00ff41]/30 transition-all shadow-sm"
            title="Back to Dashboard"
          >
            <FiHome size={18} />
          </button>

          <div className="flex items-center gap-3 overflow-hidden">
            <span className="text-gray-700 font-medium text-lg leading-none select-none">/</span>
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 overflow-hidden">
              <h1
                className="text-sm md:text-[16px] font-bold tracking-tight truncate max-w-[300px] md:max-w-[600px] lg:max-w-none"
                style={{ color: projectInfo.name ? '#fff' : 'rgba(255,255,255,0.3)' }}
                title={projectInfo.name || 'Loading project...'}
              >
                {projectInfo.name
                  ? projectInfo.name
                  : <span className="animate-pulse">Loading project...</span>
                }
              </h1>
              <div className="flex items-center gap-2">
                <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/10" />
                <span className="text-[9px] font-black text-[#00ff41] bg-[#00ff41]/5 border border-[#00ff41]/20 px-2 py-0.5 rounded uppercase tracking-[0.2em] opacity-80">
                  {projectInfo.type} NODE
                </span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
            <FiSave size={11} className="text-[#00ff41] animate-pulse" />
            <span className="text-gray-500 text-[9px] font-bold uppercase tracking-widest">
              LATEST_SYNC: {formatDistanceToNow(lastSaved, { addSuffix: true })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
            {/* Active Collaborators Profiles — always show self first, then remote peers */}
            <div className="flex -space-x-2 items-center">
               {/* Self — always online */}
               <div
                 className="relative group transition-transform hover:-translate-y-1 hover:z-30 cursor-help"
                 style={{ zIndex: 20 }}
                 title={`${localUser.name} (You)`}
               >
                 <div
                   className="w-8 h-8 rounded-full border-2 border-[#00ff41]/60 flex items-center justify-center text-xs font-bold shadow-md"
                   style={{ backgroundColor: localUser.color, color: '#000' }}
                 >
                   {localUser.name?.[0]?.toUpperCase() || 'Y'}
                 </div>
                 <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00ff41] border-[1.5px] border-[#1a1c23] rounded-full shadow-[0_0_6px_rgba(0,255,65,0.7)]"></span>
               </div>
               {/* Remote peers */}
               {Object.values(collaborators)
                 .filter(c => c.id !== socket?.id) /* exclude self from socket list */
                 .map((collab, index) => (
                 <div
                   key={collab.id}
                   className="relative group transition-transform hover:-translate-y-1 hover:z-30 cursor-help"
                   style={{ zIndex: 10 + index }}
                   title={collab.user || 'Online Hacker'}
                 >
                   <div
                     className="w-8 h-8 rounded-full border-2 border-[#1a1c23] flex items-center justify-center text-xs font-bold shadow-md"
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
             if (reactFlowWrapper.current) {
                const rect = reactFlowWrapper.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                emitCursorMove(x, y, localUser);
                
                reactFlowWrapper.current.style.setProperty('--mouse-x', `${x}px`);
                reactFlowWrapper.current.style.setProperty('--mouse-y', `${y}px`);
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
              onEdgesChange={handleEdgesChange}
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
          liveEvents={liveHistoryEvents}
          localUser={localUser}
        />
      </div>
    </div>
  );
};


export default WorkflowEditor;
