

export type User = {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    study: {
        group: {
            name: string;
        }
    };
    studyyear: {
        group: {
            name: string;
        }
    }
};