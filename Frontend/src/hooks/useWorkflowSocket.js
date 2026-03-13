import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const useWorkflowSocket = (workflowId, initialNodes = [], initialEdges = []) => {
  const [socket, setSocket] = useState(null);
  const [collaborators, setCollaborators] = useState({});
  const [cursors, setCursors] = useState({});
  
  // React Flow State that syncs with Socket
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  useEffect(() => {
    if (!workflowId) return;

    // Connect to the WebSocket server
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Join the specific workflow room
    newSocket.emit('join-workflow', workflowId);

    // -- Event Listeners --

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

  return {
    socket,
    collaborators,
    cursors,
    nodes,
    setNodes: setNodes, // Just local update without emitting (used by React Flow internal handlers usually)
    edges,
    setEdges: setEdges,
    emitWorkflowChange,
    emitCursorMove
  };
};

export default useWorkflowSocket;
