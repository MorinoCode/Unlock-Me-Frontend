// import { useEffect } from "react";
// import { useSocket } from "../context/useSocket"; 
// import toast from "react-hot-toast";

// /**
//  * Custom hook to handle real-time notifications via Socket.io
//  * Ensure this file is saved exactly as useNotification.jsx if your App.jsx imports it that way.
//  */
// const useNotifications = () => {
//   const { socket } = useSocket();

//   useEffect(() => {
//     if (!socket) return;

//     // Triggered when the backend calls emitNotification helper
//     const handleNewNotification = (data) => {

//       // Play Sound
//       const audio = new Audio("/notification.mp3");
//       audio.play().catch((err) => console.log("Audio blocked by browser",err));

//       // Display Custom Toast
//       toast.custom(
//         (t) => (
//           <div className={`notif-toast ${t.visible ? "notif-toast--enter" : "notif-toast--leave"}`}>
//             <div className="notif-toast__avatar-wrap">
//               {data.senderAvatar ? (
//                 <img src={data.senderAvatar} alt="" className="notif-toast__avatar" />
//               ) : (
//                 <div className="notif-toast__icon-fallback">
//                   {data.type === "LIKE" ? "❤️" : data.type === "MATCH" ? "🔥" : "💬"}
//                 </div>
//               )}
//             </div>
//             <div className="notif-toast__body">
//               <h4 className="notif-toast__name">{data.senderName}</h4>
//               <p className="notif-toast__msg">{data.message}</p>
//             </div>
//           </div>
//         ),
//         {
//           duration: 5000,
//           position: "top-right",
//         }
//       );
//     };

//     socket.on("new_notification", handleNewNotification);

//     return () => {
//       socket.off("new_notification", handleNewNotification);
//     };
//   }, [socket]);
// };

// export default useNotifications;