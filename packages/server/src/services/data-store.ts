import { DeliveryStop, Route, Driver, ImportJob, DeliveryProof } from '@droute/shared';

class DataStore {
  private stops: Map<string, DeliveryStop> = new Map();
  private routes: Map<string, Route> = new Map();
  private drivers: Map<string, Driver> = new Map();
  private importJobs: Map<string, ImportJob> = new Map();
  private deliveryProofs: Map<string, DeliveryProof> = new Map();

  // Stops
  addStop(stop: DeliveryStop): void {
    this.stops.set(stop.id, stop);
  }

  addStops(stops: DeliveryStop[]): void {
    stops.forEach((stop) => this.stops.set(stop.id, stop));
  }

  getStop(id: string): DeliveryStop | undefined {
    return this.stops.get(id);
  }

  getAllStops(): DeliveryStop[] {
    return Array.from(this.stops.values());
  }

  clearStops(): void {
    this.stops.clear();
  }

  // Routes
  addRoute(route: Route): void {
    this.routes.set(route.id, route);
  }

  addRoutes(routes: Route[]): void {
    routes.forEach((route) => this.routes.set(route.id, route));
  }

  getRoute(id: string): Route | undefined {
    return this.routes.get(id);
  }

  getAllRoutes(): Route[] {
    return Array.from(this.routes.values());
  }

  getRoutesByDriver(driverId: string): Route[] {
    return Array.from(this.routes.values()).filter((route) => route.driverId === driverId);
  }

  updateRoute(id: string, updates: Partial<Route>): Route | undefined {
    const route = this.routes.get(id);
    if (route) {
      Object.assign(route, updates);
    }
    return route;
  }

  // Drivers
  addDriver(driver: Driver): void {
    this.drivers.set(driver.id, driver);
  }

  addDrivers(drivers: Driver[]): void {
    drivers.forEach((driver) => this.drivers.set(driver.id, driver));
  }

  getDriver(id: string): Driver | undefined {
    return this.drivers.get(id);
  }

  getAllDrivers(): Driver[] {
    return Array.from(this.drivers.values());
  }

  // Import Jobs
  addImportJob(job: ImportJob): void {
    this.importJobs.set(job.id, job);
  }

  getImportJob(id: string): ImportJob | undefined {
    return this.importJobs.get(id);
  }

  updateImportJob(id: string, updates: Partial<ImportJob>): ImportJob | undefined {
    const job = this.importJobs.get(id);
    if (job) {
      Object.assign(job, updates);
    }
    return job;
  }

  getAllImportJobs(): ImportJob[] {
    return Array.from(this.importJobs.values());
  }

  // Delivery Proofs
  addDeliveryProof(proof: DeliveryProof): void {
    this.deliveryProofs.set(proof.id, proof);
  }

  getDeliveryProof(id: string): DeliveryProof | undefined {
    return this.deliveryProofs.get(id);
  }

  getDeliveryProofsByRoute(routeId: string): DeliveryProof[] {
    return Array.from(this.deliveryProofs.values()).filter((proof) => proof.routeId === routeId);
  }
}

// Singleton instance
export const dataStore = new DataStore();

// Initialize with default drivers
dataStore.addDrivers([
  {
    id: 'driver_1',
    name: 'Ahmad',
    vehicleNumber: 'SG001',
    phoneNumber: '6581234561',
    status: 'active',
  },
  {
    id: 'driver_2',
    name: 'Bala',
    vehicleNumber: 'SG002',
    phoneNumber: '6581234562',
    status: 'active',
  },
  {
    id: 'driver_3',
    name: 'Chen',
    vehicleNumber: 'SG003',
    phoneNumber: '6581234563',
    status: 'active',
  },
  {
    id: 'driver_4',
    name: 'David',
    vehicleNumber: 'SG004',
    phoneNumber: '6581234564',
    status: 'active',
  },
  {
    id: 'driver_5',
    name: 'Ethan',
    vehicleNumber: 'SG005',
    phoneNumber: '6581234565',
    status: 'active',
  },
]);
