import type { PlotPoint } from '@/lib/plot'
import type { Extreme } from '@/types'

/** An extreme rescaled into the graph's 0–100 space, keeping its original fields. */
export type PlottedExtreme = Extreme & PlotPoint
