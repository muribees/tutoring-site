// Everything written on the site lives here. Edit this file to change the text.

export const site = {
  name: "Maria Uribe Estrada",
  firstName: "Maria",
  contactEmail: "marifer.uribest@gmail.com",
  phone: "650-796-7702",
  // Paste your Calendly link here to show a "Schedule on Calendly" button.
  calendlyUrl: "",
  intro:
    "I'm a senior at Palo Alto High School, and I've been tutoring math, Spanish, and computer science for over two years. I work with students from elementary school through high school.",
  about: [
    "I tutor the subjects I know best from my own classes. I finished AP Calculus AB and I'm taking BC now. Spanish is my first language, and I got a 5 on the AP exam. In computer science I've taken AP CSA and the CS Capstone, and I'm in AP Cybersecurity this year.",
    "Sessions follow what each student needs, whether that's homework, a test coming up, or going back over something that didn't click in class.",
  ],
};

export type SubjectKey = "math" | "spanish" | "cs";

export const subjects: {
  key: SubjectKey;
  name: string;
  helpWith: string[];
  background: string[];
}[] = [
  {
    key: "math",
    name: "Math",
    helpWith: ["Algebra and precalculus", "AP Calculus AB and BC", "Homework and test prep"],
    background: ["AP Calculus BC (currently taking)", "AP Calculus AB (completed)"],
  },
  {
    key: "spanish",
    name: "Spanish",
    helpWith: ["Grammar and verb conjugation", "Conversation and pronunciation", "Reading, writing, and AP prep"],
    background: ["Native speaker", "AP Spanish Language: score of 5"],
  },
  {
    key: "cs",
    name: "Computer Science",
    helpWith: ["Learning to code from the start", "AP CSA (Java)", "Websites and iOS apps"],
    background: [
      "AP Computer Science A",
      "Computer Science Capstone",
      "AP Cybersecurity (currently taking)",
      "Python, Java, JavaScript, HTML/CSS, Swift",
    ],
  },
];
