import { IAction } from "./IAction";
import { ActionContext, IActionContext } from "./ActionContext";
import { useMemo, useState } from "react";

export const ActionContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [allRegisteredActions, setAllRegisteredActions] = useState<
    Map<string, IAction>
  >(new Map());

  const contextValue = useMemo<IActionContext>(() => {
    return {
      addAction: (action: IAction) => {
        allRegisteredActions.set(action.key, action);
        setAllRegisteredActions(allRegisteredActions);
        console.log(allRegisteredActions);
      },
      removeAction: (action: IAction) => {
        allRegisteredActions.delete(action.key);
        setAllRegisteredActions(allRegisteredActions);
        console.log(allRegisteredActions);
      },
    };
  }, [allRegisteredActions]);

  return (
    <ActionContext.Provider value={contextValue}>
      {children}
    </ActionContext.Provider>
  );
};
