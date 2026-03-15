import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const useWorkflowSocket = (workflowId, initialNodes = [], initialEdges = []) => {
  const [socket, setSocket] = useState(null);
  const [collaborators, setCollaborators] = useState({});
  const [cursors, setCursors] = useState({});
  const [activeNodes, setActiveNodes] = useState({}); // { nodeId: { socketId: userInfo } }
  
  // React Flow State that syncs with Socket
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const [localUser] = useState({
    name: `User_${Math.floor(Math.random() * 1000)}`,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`,
  });

  useEffect(() => {
    if (!workflowId) return;

    // Connect to the WebSocket server
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Join the specific workflow room with user info
    newSocket.emit('join-workflow', { workflowId, user: localUser.name, color: localUser.color });

    // -- Event Listeners --

    newSocket.on('collaborators-list', (list) => {
      const collabMap = {};
      list.forEach(c => { collabMap[c.id] = c; });
      setCollaborators(collabMap);
    });

    newSocket.on('user-joined', (data) => {
      setCollaborators((prev) => ({ ...prev, [data.id]: data }));
    });

    newSocket.on('user-left', (data) => {
      setCollaborators((prev) => {
        const newCollabs = { ...prev };
        delete newCollabs[data.id];
        return newCollabs;
      });
      setCursors((prev) => {
        const newCursors = { ...prev };
        delete newCursors[data.id];
        return newCursors;
      });
      setActiveNodes((prev) => {
        const newActive = { ...prev };
        Object.keys(newActive).forEach(nodeId => {
          if (newActive[nodeId][data.id]) {
            const users = { ...newActive[nodeId] };
            delete users[data.id];
            if (Object.keys(users).length === 0) {
              delete newActive[nodeId];
            } else {
              newActive[nodeId] = users;
            }
          }
        });
        return newActive;
      });
    });

    // Handle Remote Graph Changes (someone else moved a node)
    newSocket.on('workflow-updated', (data) => {
      if (data.nodes) setNodes(data.nodes);
      if (data.edges) setEdges(data.edges);
    });

    // Handle remote cursor movement
    newSocket.on('cursor-updated', (data) => {
      setCursors((prev) => ({
        ...prev,
        [data.socketId]: { x: data.x, y: data.y, user: data.user }
      }));
    });

    // Handle remote node focus
    newSocket.on('node-focused', (data) => {
      setActiveNodes((prev) => {
        const newActive = { ...prev };
        
        // Remove this user from any other node they were focused on
        Object.keys(newActive).forEach(nodeId => {
          if (newActive[nodeId][data.socketId]) {
            const users = { ...newActive[nodeId] };
            delete users[data.socketId];
            if (Object.keys(users).length === 0) {
              delete newActive[nodeId];
            } else {
              newActive[nodeId] = users;
            }
          }
        });

        // Add to new node if nodeId is provided
        if (data.nodeId) {
          newActive[data.nodeId] = {
            ...(newActive[data.nodeId] || {}),
            [data.socketId]: { user: data.user, color: data.color }
          };
        }
        
        return newActive;
      });
    });

    // Cleanup when component unmounts
    return () => {
      newSocket.emit('leave-workflow', workflowId);
      newSocket.disconnect();
    };
  }, [workflowId]);

  // -- Emitting Changes --

  const emitWorkflowChange = useCallback((newNodes, newEdges) => {
    if (!socket) return;
    
    // update local state
    setNodes(newNodes);
    setEdges(newEdges);

    // broadcast to others
    socket.emit('workflow-change', {
      workflowId,
      nodes: newNodes,
      edges: newEdges
    });
  }, [socket, workflowId]);

  const emitCursorMove = useCallback((x, y, user) => {
    if (!socket) return;
    socket.emit('cursor-move', { workflowId, x, y, user });
  }, [socket, workflowId]);

  const emitNodeFocus = useCallback((nodeId, user, color) => {
    if (!socket) return;
    socket.emit('node-focus', { workflowId, nodeId, user, color });
  }, [socket, workflowId]);

  return {
    socket,
    collaborators,
    cursors,
    activeNodes,
    nodes,
    setNodes: setNodes,
    edges,
    setEdges: setEdges,
    emitWorkflowChange,
    emitCursorMove,
    emitNodeFocus,
    user: localUser
  };
};

export default useWorkflowSocket;
