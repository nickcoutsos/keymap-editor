import { createContext } from "react";

export const DefinitionsContext = createContext({
  keycodes: [],
  behaviours: []
})

export const SearchContext = createContext({
  getSearchTargets: null
})
