// src/data/bands.ts

export type Band = {
  name: string;
  img: string;           // /images/... path (in public/)
  desc: string;
  socials?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;    // channel/page (not embed)
    spotify?: string;    // profile (not embed)
  };
  // 👇 Paste ONLY the embed URL strings here (not the whole <iframe>)
  youtubeEmbed?: string; // e.g. "https://www.youtube.com/embed/dQw4w9WgXcQ"
  spotifyEmbed?: string; // e.g. "https://open.spotify.com/embed/artist/3wnTCt...?...”
};

export const bands: Band[] = [
    {
    name: "Intoxicated",
    img: "/images/bands/Intoxicated_card.jpg",
    desc: "German speed/black heavy metal...",
    socials: {
      facebook: "https://www.facebook.com/intoexicated",
      instagram: "https://www.instagram.com/intoexicated?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
      youtube: "https://www.youtube.com/playlist?list=OLAK5uy_kkTxGnKh_jIqgJs-fwKndNVtGhPydi2Ng",
      spotify: "https://open.spotify.com/artist/1HjPbTAbwuUCiIpzLFZqTn?si=tKwrRN75TKqF6ilviLRmpw",
    },
    youtubeEmbed: "https://www.youtube.com/embed/n-OrpwDdSPU?si=KJYdP8bNNIAbF_NF",
    spotifyEmbed:
      "https://open.spotify.com/embed/artist/1HjPbTAbwuUCiIpzLFZqTn?utm_source=generator"
  },
  {
    name: "Diabolic Night",
    img: "/images/bands/DN_card.jpg",
    desc: "German speed/black heavy metal...",
    socials: {
      facebook: "https://www.facebook.com/diabolicnight",
      instagram: "https://www.instagram.com/diabolicnightofficial?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
      youtube: "https://www.youtube.com/channel/UCsaH0-FMrpkjaLfWUN1A8uQ",
      spotify: "https://open.spotify.com/artist/3wnTCtUXbClNxJNfYtH0mF?si=tnBO1XYfQGunGKZLFPuNFQ",
    },
    youtubeEmbed: "https://www.youtube.com/embed/e0VVMfMZ5Ng?si=d0DQbmwDZ4MYVip5",
    spotifyEmbed:
      "https://open.spotify.com/embed/artist/3wnTCtUXbClNxJNfYtH0mF?utm_source=generator"
  },
  {
    name: "Gallower",
    img: "/images/bands/Gallower_card.jpg",
    desc: "Polish speed metal strike...",
    socials: {
      facebook: "https://www.facebook.com/search/top?q=gallower",
      instagram: "https://www.instagram.com/gallower_hunts/",
      youtube:"https://www.youtube.com/@gallowerofficial9959",
      spotify: "https://open.spotify.com/artist/3mJCmX2022lM57gZGfiX3N?si=O2gjR4NuQSeNNgaEJUuAUQ",
    },
    youtubeEmbed: "https://www.youtube.com/embed/INBBVewWs2Q?si=8mof7IAUZhG2qN7n",
    spotifyEmbed:
      "https://open.spotify.com/embed/artist/3mJCmX2022lM57gZGfiX3N?utm_source=generator",
  },
  {
    name: "Unbaptised",
    img: "/images/bands/Unbaptised_card.jpg",
    desc: "Raw Bulgarian underground.",
    socials: {
      facebook: "https://www.facebook.com/profile.php?id=61556518373563",
      instagram: "https://www.instagram.com/unbaptisedband/",
      youtube:"https://www.youtube.com/@unbaptisedofficial",
      spotify: "https://open.spotify.com/artist/4amw9upi92SZw1Ktfox6Hz?si=pg4tthPrQ1ueU8x9jUNtjQ",
    },
    youtubeEmbed: "https://www.youtube.com/embed/70cLgwfXTOI?si=uNDUkbqZHShx-EKc",
    spotifyEmbed:
      "https://open.spotify.com/embed/artist/4amw9upi92SZw1Ktfox6Hz?utm_source=generator",
  
  },
  {
    name: "Leatherhead",
    img: "/images/bands/Leatherhead_card.jpg",
    desc: "Heavy leather, heavy riffs.",
     socials: {
      facebook: "https://www.facebook.com/LeatherHeadofficial",
      instagram: "https://www.instagram.com/leatherhead_band?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
      youtube:"https://www.youtube.com/channel/UC8Tsv6cTCsT8t0uyLf-4e7A",
      spotify: "https://open.spotify.com/artist/7pekQ0Ewu8Xqb9gX203CHC?si=ngArCzBESDCk1ps9ECt3wA",
    },
    youtubeEmbed: "https://www.youtube.com/embed/-0rIk7MWLQc?si=vukqmUyhpACKZl4x",
    spotifyEmbed:
      "https://open.spotify.com/embed/artist/7pekQ0Ewu8Xqb9gX203CHC?utm_source=generator",
  
  },
];
