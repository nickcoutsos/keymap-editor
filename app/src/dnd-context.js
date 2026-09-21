import { createContext, useState, useContext, useEffect, useCallback } from "react";

const delay = ms => new Promise(res => setTimeout(res, ms));

const DndContext = createContext({})

export function DndContextProvider({ children, handleSwapBind }) {
  const [grabKey, setGrabKey] = useState();
  const [hoverKey, setHoverKey] = useState();

  function handleGrabKey(key) {
    if (!grabKey || grabKey?.index !== key.index) {
      setGrabKey(key)
    }
  }

  const handleDropKey = useCallback(() => {
    const grabKeyI = grabKey.index
    const hoverKeyI = hoverKey.index

    handleSwapBind(grabKeyI, grabKey.key, hoverKeyI, hoverKey.key)

    setGrabKey(undefined)
    setHoverKey(undefined)
  }, [grabKey, hoverKey]);

  useEffect(() => {
    document.addEventListener('dragend', function(event) {
      const element = document.elementFromPoint(event.clientX, event.clientY);

      if (!!element.attributes['data-dnd']) {
        const parsed = JSON.parse(element.attributes['data-dnd'].value)

        setHoverKey(parsed)
      }
    });

    return () => {
      document.removeEventListener("dragend", () => {});
    };
  }, []);

  useEffect(() => {
    if (hoverKey) handleDropKey()
  }, [hoverKey]);

  return (
    <DndContext.Provider value={{
      handleGrabKey,
    }}>
      {children}
    </DndContext.Provider>
  )
}

export function useDnd() {
  return useContext(DndContext)
}