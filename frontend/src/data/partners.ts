export type Partner = {
  id: string;
  name: string;
  url: string;
  logo: string; // path to logo image
};

export const partners: Partner[] = [
  {
    id: "britos",
    name: "Britos Beer",
    url: "https://britos.bg/",
    logo: "/images/partners/britos.png", // put the logo here
  },
];
