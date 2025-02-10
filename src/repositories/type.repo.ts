export type Repo<T, C> = {
  readAll(): Promise<T[]>;
  readById(id: string): Promise<T>;
  create(data: C): Promise<T>;
  update(id:string, data: Partial<C>): Promise<T>;
  delete(id: string): Promise<T>;
};

export type WithLoginRepo<T, C> = Repo<T, C> & {
  searchForLogin(key: 'email', value: string): Promise<Partial<T>>;
};

export type WithAppointmentFeatures<T, C> = Repo<T, C> & {
  approveCancellation(id: string): Promise<T>;
};
