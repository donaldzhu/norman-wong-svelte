import type { SlideData } from "$lib/types/sanity"
import { createContext } from "svelte"

export interface SlideContext {
  slide: SlideData | undefined
  autoPlay: boolean
}

export const [getSlideContext, setSlideContext] =
  createContext<SlideContext>()
