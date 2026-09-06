export interface IAppContactsSocial {
  facebook: string;
  instagram: string;
  x: string;
  youtube: string;
  telegram: string;
}

export interface IAppContactsValue {
  mobile: string;
  whatsapp: string;
  email: string;
  social: IAppContactsSocial;
}

export function emptyAppContacts(): IAppContactsValue {
  return {
    mobile: "",
    whatsapp: "",
    email: "",
    social: {
      facebook: "",
      instagram: "",
      x: "",
      youtube: "",
      telegram: "",
    },
  };
}
