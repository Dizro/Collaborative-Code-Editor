import React, { useState } from "react";
import { FiUsers, FiMessageSquare, FiMic, FiX, FiMenu } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import RoomInvite from "./RoomInvite";
import VoiceChat from "./VoiceChat";
import TextChat from "./TextChat";
import ThemeSwitcher from "../ThemeSwitcher";
import DownloadProjectButton from "../DownloadProjectButton";
import ImportRepoButton from "../ImportRepoButton";

interface NavbarProps {
  roomId: string;
  username: string;
  isPrivate: boolean;
  onNewRoom: () => void;
  onLeave: () => void;
}

type PanelType = "invite" | "voice" | "chat";

interface Panel {
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

type Panels = {
  [key in PanelType]: Panel;
};

const Navbar: React.FC<NavbarProps> = ({ roomId, username, isPrivate, onNewRoom, onLeave }) => {
  const [activePanel, setActivePanel] = useState<PanelType | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const panels: Panels = {
    invite: { title: "Пригласить", icon: <FiUsers size={20} />, component: <RoomInvite roomId={roomId} isPrivate={isPrivate} /> },
    voice: { title: "Голос", icon: <FiMic size={20} />, component: <VoiceChat /> },
    chat: { title: "Чат", icon: <FiMessageSquare size={20} />, component: <TextChat username={username} /> },
  };

  const Logo = () => (
    <svg width="32" height="32" viewBox="0 0 51 54" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary">
      <path d="M1.48897 10.9374L1.65286 10.7946C1.72057 10.7355 1.78338 10.6711 1.84069 10.602C2.15661 10.2207 2.62602 10 3.1212 10H3.35126C3.76 10 4.16029 10.1164 4.50531 10.3356L4.74614 10.4885C5.65126 11.0635 6.19954 12.0613 6.19954 13.1336V32.593C6.19954 32.8244 6.22566 33.055 6.27739 33.2805C6.45277 34.0448 6.91365 34.7133 7.56571 35.1489L22.5849 45.1843C23.0446 45.4914 23.5431 45.7361 24.0673 45.9118L24.5958 46.089C24.8848 46.1859 25.1875 46.2353 25.4923 46.2353C26.0319 46.2353 26.5603 46.0804 27.0146 45.7891L43.4278 35.264C43.64 35.1279 43.8324 34.963 43.9994 34.774C44.4402 34.2753 44.6835 33.6326 44.6835 32.967V13.8088C44.6835 13.2371 44.8069 12.6722 45.0454 12.1526L45.1566 11.9101C45.3075 11.5813 45.5236 11.2866 45.7918 11.0438C46.283 10.5992 46.9219 10.3529 47.5845 10.3529H47.6802C48.4575 10.3529 49.2026 10.6629 49.7506 11.214L49.9515 11.4161C50.6231 12.0915 51 13.0052 51 13.9576V33.8314C51 35.2568 50.6616 36.6617 50.0127 37.9308C49.2806 39.3625 48.1784 40.5721 46.8207 41.4338L28.5845 53.0075C27.563 53.6558 26.3782 54 25.1685 54C23.9344 54 22.7269 53.6418 21.6924 52.9689L4.66764 41.8949C2.77828 40.6659 1.34594 38.8492 0.591733 36.7252C0.200129 35.6224 0 34.4608 0 33.2905V19.0588V14.2105C0 12.9556 0.542966 11.762 1.48897 10.9374Z" fill="currentColor" />
      <path d="M15.6692 21.1528L22.9362 16.6313C24.5432 15.6314 26.577 15.6246 28.1907 16.6138L34.8302 20.6836C34.9898 20.7815 35.1296 20.9086 35.2422 21.0583C35.6797 21.6397 35.6334 22.452 35.1327 22.98L34.7238 23.4112L32.0993 25.4928C30.9545 26.4007 29.3686 26.5095 28.1105 25.7664C26.532 24.9341 24.6286 25.0109 23.1223 25.9677L21.8536 26.7736C21.6209 26.9215 21.3508 27 21.075 27C20.7474 27 20.4294 26.8892 20.1726 26.6856L16.2456 23.5709C16.1118 23.4648 15.9913 23.343 15.8866 23.2081L15.411 22.5951C15.1629 22.2754 15.1352 21.8366 15.3412 21.4883C15.4219 21.3517 15.5345 21.2366 15.6692 21.1528Z" fill="currentColor" />
      <path d="M19.0465 13.4493L22.6794 10.9673C24.2921 9.86551 26.3987 9.80363 28.0733 10.8089L35.5725 15.3106C36.178 15.6741 36.9651 15.4157 37.2374 14.7641C37.2805 14.661 37.3084 14.5523 37.3203 14.4412L37.6694 11.1923C37.872 9.30727 36.991 7.46981 35.3943 6.44743L28.0566 1.7488C26.3953 0.685015 24.2639 0.697446 22.6151 1.78054L15.4419 6.49275C13.9624 7.47623 13.2168 9.25099 13.5502 10.996L14.2995 14.9183C14.3602 15.2364 14.5591 15.511 14.8424 15.6679C15.2089 15.8709 15.6593 15.8462 16.0013 15.6042L19.0465 13.4493Z" fill="currentColor" />
    </svg>
  );

  return (
    <>
      <div className="bg-background border-b border-border">
        <div className="hidden lg:flex px-6 py-4 justify-between items-center">
          <div className="flex items-center space-x-6">
            <Logo />
            <div>
              <h1 className="text-foreground text-lg font-medium mb-1">Комната: {roomId}</h1>
              <p className="text-sm text-foreground-secondary">Участник: <span className="text-foreground">{username}</span></p>
            </div>
            <button onClick={onNewRoom} className="px-4 py-2.5 bg-background text-primary border border-border rounded-xl hover:border-primary/50 hover:bg-background-secondary transition-colors duration-200 text-sm font-medium">Новая комната</button>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeSwitcher />
            <ImportRepoButton username={username} />
            <DownloadProjectButton />
            <div className="h-6 w-px bg-border mx-2" />
            {(Object.entries(panels) as [PanelType, Panel][]).map(([key, panel]) => (
              <button key={key} onClick={() => setActivePanel(activePanel === key ? null : key)} className={`p-3 rounded-xl transition-colors duration-200 ${activePanel === key ? "bg-primary text-primary-foreground" : "text-foreground-secondary hover:bg-background-secondary"}`} title={panel.title}>{panel.icon}</button>
            ))}
            <div className="h-6 w-px bg-border mx-2" />
            <button onClick={onLeave} className="px-4 py-2.5 text-foreground-secondary border border-border rounded-xl hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-colors duration-200 text-sm font-medium">Покинуть комнату</button>
          </div>
        </div>
        <div className="lg:hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo />
              <div className="text-sm">
                <h1 className="text-foreground font-medium">Комната: {roomId}</h1>
                <p className="text-foreground-secondary">{username}</p>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-foreground-secondary hover:bg-background-secondary rounded-xl">{isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}</button>
          </div>
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border-t border-border">
                <div className="p-4 space-y-3">
                  <button onClick={onNewRoom} className="w-full px-4 py-2.5 bg-background text-primary border border-border rounded-xl hover:border-primary/50 hover:bg-background-secondary transition-colors duration-200 text-sm font-medium">Новая комната</button>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(panels) as [PanelType, Panel][]).map(([key, panel]) => (
                      <button key={key} onClick={() => { setActivePanel(activePanel === key ? null : key); setIsMobileMenuOpen(false); }} className={`p-3 rounded-xl transition-colors duration-200 flex flex-col items-center ${activePanel === key ? "bg-primary text-primary-foreground" : "text-foreground-secondary hover:bg-background-secondary"}`}>
                        {panel.icon}
                        <span className="text-xs mt-1">{panel.title}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <ThemeSwitcher />
                    <ImportRepoButton username={username} />
                    <DownloadProjectButton />
                  </div>
                  <button onClick={onLeave} className="w-full px-4 py-2.5 text-foreground-secondary border border-border rounded-xl hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-colors duration-200 text-sm font-medium">Покинуть комнату</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {activePanel && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-[998]" onClick={() => setActivePanel(null)} />
            <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }} transition={{ type: "spring", damping: 20 }} className="fixed right-0 top-0 h-screen w-full sm:w-[400px] bg-background shadow-xl z-[999] overflow-hidden flex flex-col border-l border-border">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h3 className="text-foreground font-medium">{activePanel ? panels[activePanel].title : ""}</h3>
                <button onClick={() => setActivePanel(null)} className="p-2 text-foreground-secondary hover:bg-background-secondary rounded-xl transition-colors duration-200"><FiX size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">{activePanel ? panels[activePanel].component : null}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
