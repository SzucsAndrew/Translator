export class User {
    name: string;
    email: string;
    phoneNumber: string;
    termsAccepted: boolean;

    constructor(name: string, email: string, phoneNumber: string, termsAccepted: boolean) {
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.termsAccepted = termsAccepted;
    }
}
