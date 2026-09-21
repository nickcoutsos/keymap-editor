import { createContext } from "react";

export * from "./dnd-context.js"

export const DefinitionsContext = createContext({
  keycodes: [],
  behaviours: []
})

export const SearchContext = createContext({
  getSearchTargets: null
})
