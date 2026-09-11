import { DeliveryStop } from '@droute/shared';
import { osrmService } from '../services/osrm-routing';

export class TSPSolver {
  async solveWithFixedStartEnd(
    stops: DeliveryStop[],
    startStop: DeliveryStop,
    endStop: DeliveryStop
  ): Promise<{ orderedStops: DeliveryStop[]; totalDistance: number; totalDuration: number }> {
    if (stops.length <= 2) {
      return {
        orderedStops: stops,
        totalDistance: 0,
        totalDuration: 0,
      };
    }

    // Filter stops to only include those between start and end (excluding start and end themselves)
    const intermediateStops = stops.filter(
      (s) => s.id !== startStop.id && s.id !== endStop.id
    );

    if (intermediateStops.length === 0) {
      return {
        orderedStops: [startStop, endStop],
        totalDistance: await this.calculateRouteDist([startStop, endStop]),
        totalDuration: 0,
      };
    }

    // Use nearest neighbor heuristic starting from startStop
    const ordered = await this.nearestNeighborTSP(startStop, intermediateStops, endStop);

    const totalDistance = await this.calculateRouteDist(ordered);

    return {
      orderedStops: ordered,
      totalDistance,
      totalDuration: Math.round(totalDistance * 1.5), // Rough estimate: ~90 sec per km
    };
  }

  private async nearestNeighborTSP(
    start: DeliveryStop,
    unvisited: DeliveryStop[],
    end: DeliveryStop
  ): Promise<DeliveryStop[]> {
    const route: DeliveryStop[] = [start];
    let remaining = [...unvisited];

    while (remaining.length > 0) {
      const current = route[route.length - 1];

      // Find nearest unvisited stop
      let nearest = remaining[0];
      let minDistance = await osrmService.calculateDistance(current, remaining[0]);

      for (let i = 1; i < remaining.length; i++) {
        const dist = await osrmService.calculateDistance(current, remaining[i]);
        if (dist < minDistance) {
          minDistance = dist;
          nearest = remaining[i];
        }
      }

      route.push(nearest);
      remaining = remaining.filter((s) => s.id !== nearest.id);
    }

    route.push(end);
    return route;
  }

  private async calculateRouteDist(stops: DeliveryStop[]): Promise<number> {
    if (stops.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      totalDistance += await osrmService.calculateDistance(stops[i], stops[i + 1]);
    }
    return totalDistance;
  }
}

export const tspSolver = new TSPSolver();
