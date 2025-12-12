"use client"

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

// Types
interface ClickState {
  userProfile: boolean;
  notification: boolean;
  info: Record<string, any>;
}

interface StateContextType {
  activeMenu: boolean;
  setActiveMenu: Dispatch<SetStateAction<boolean>>;
  isClicked: ClickState;
  setIsClicked: Dispatch<SetStateAction<ClickState>>;
  handleClick: (clicked: keyof ClickState) => void;
  screenSize: number | undefined;
  setScreenSize: Dispatch<SetStateAction<number | undefined>>;
}

interface ContextProviderProps {
  children: ReactNode;
}

// Initial state
const initialState: ClickState = {
  userProfile: false,
  notification: false,
  info: {},
};

// Default context value
const defaultContextValue: StateContextType = {
  activeMenu: true,
  setActiveMenu: () => {},
  isClicked: initialState,
  setIsClicked: () => {},
  handleClick: () => {},
  screenSize: undefined,
  setScreenSize: () => {},
};

// Create context with default value (optional, helps with IDE autocomplete)
const StateContext = createContext<StateContextType>(defaultContextValue);

export const ContextProvider = ({ children }: ContextProviderProps) => {
  const [activeMenu, setActiveMenu] = useState<boolean>(true);
  const [isClicked, setIsClicked] = useState<ClickState>(initialState);
  const [screenSize, setScreenSize] = useState<number | undefined>(undefined);

  const handleClick = (clicked: keyof ClickState) => {
    setIsClicked({ ...initialState, [clicked]: true });
  };

  return (
    <StateContext.Provider
      value={{
        activeMenu,
        setActiveMenu,
        isClicked,
        setIsClicked,
        handleClick,
        screenSize,
        setScreenSize,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = (): StateContextType => {
  return useContext(StateContext);
};