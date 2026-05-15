import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useNotifications } from '../context/NotificationContext';

const SOCKET_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '')
    .replace('/api/v1', '') || 'http://localhost:4000';

const useNotificationSocket = (accessToken, user) => {
    const [socket, setSocket] = useState(null);
    const { addNotification } = useNotifications();

    useEffect(() => {
        if (!accessToken || !user) return;

        const newSocket = io(SOCKET_URL, {
            auth: { token: accessToken },
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            console.log('📡 Notification socket connected:', newSocket.id);
        });

        newSocket.on('connect_error', (err) => {
            console.error('📡 Notification socket connection error:', err.message);
        });

        newSocket.on('notification', (data) => {
            console.log('🔔 Notification received:', data);
            
            // Add to global notification state for the panel
            addNotification(data);
            
            // Custom toast styling for notifications
            toast.custom((t) => (
                <div
                    className={`${
                        t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-[#111] border border-white/10 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5`}
                >
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="shrink-0 pt-0.5">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                    data.type === 'INVITE_RECEIVED' ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30' :
                                    data.type === 'INVITE_REJECTED' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' :
                                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                }`}>
                                    {data.type === 'INVITE_RECEIVED' ? 'M' : 'S'}
                                </div>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-bold text-white">
                                    {data.title || 'New Alert'}
                                </p>
                                <p className="mt-1 text-xs text-gray-400 font-mono">
                                    {data.message}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-l border-white/10">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-white/40 hover:text-white transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            ), {
                duration: 6000,
                position: 'top-right'
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [accessToken, user]);

    return socket;
};

export default useNotificationSocket;
