import { create } from "zustand";

const useDarkModeStore = create((set) => ({
    darkMode: false,
    toggleDarkMode: () => set((state) => {
        const newMode = !state.darkMode;
        localStorage.setItem("darkMode", JSON.stringify(newMode));
        return { darkMode: newMode };
    }),
    setDarkMode: (value) =>
        set(() => {
            localStorage.setItem("darkMode", JSON.stringify(value));
            return { darkMode: value };
        }),

}));

export default useDarkModeStore;
