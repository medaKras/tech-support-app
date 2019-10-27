export interface IUser {
    carNumber: string;
    location: {
        lat: number;
        lng: number;
    };
    techSupportWorker?: IWorker; 
}

export interface IWorker {
    id: number;
    name: string;
    phone: string;
    location: {
        lat: number;
        lng: number;
    }
}