/**
 * ============================================================================
 * ROLE POPUP CONFIGURATION (Edit all popup content here!)
 * ============================================================================
 * 
 * Each role (pilot, coach, human) contains:
 *  - title: Heading on the banner
 *  - bannerImage: Custom image URL (leave null to use the card's active photo)
 *  - quote: Highlighted pull-quote in terracotta
 *  - facts: Array of { title, desc }
 *  - writeup: Array of 3 paragraphs (first letter of 1st paragraph gets a drop cap)
 *  - youtube: Array of YouTube video IDs (e.g. ["dQw4w9WgXcQ"]). If ID starts with "YOUR_", a placeholder is shown.
 *  - instagram: Array of Instagram reel/post codes (e.g. ["Cx9ABC123"]). If code starts with "YOUR_", a placeholder is shown.
 */

export const ROLE_MODAL_DATA = {
  pilot: {
    title: "PILOT",
    bannerImage: null, // null defaults to the Pilot card photo
    quote: "Calm is a skill. You can train it.",
    facts: [
      {
        title: "Real experience",
        desc: "Life in high-pressure environments"
      },
      {
        title: "Discipline",
        desc: "Checklists, clarity, calm decisions"
      }
    ],
    writeup: [
      "Aasman mein pehli udaan ke baad mujhe samajh aaya ki shaant rehna koi talent nahi, ek abhyas hai. Cockpit mein har faisla seconds mein hota hai, aur har faisle ke peeche training, checklist aur bharosa hota hai.",
      "Saalon tak high-pressure environments mein kaam karke maine seekha ki dabav ko hatana zaroori nahi, use samajhna zaroori hai. Wahi seekh aaj meri coaching ki neev hai.",
      "Runway ki roshni jaise hi saaf dikhti hai, rasta bhi saaf ho jaata hai. Bas pehla kadam lena hota hai."
    ],
    youtube: ["YOUR_YT_ID_1", "YOUR_YT_ID_2"],
    instagram: ["YOUR_IG_CODE_1", "YOUR_IG_CODE_2"]
  },

  coach: {
    title: "COACH",
    bannerImage: null, // null defaults to the Coach card photo
    quote: "I walk beside you, not ahead of you.",
    facts: [
      {
        title: "Deep training",
        desc: "Backed by science, rooted in empathy"
      },
      {
        title: "ICF-certified",
        desc: "Evidence-based, human-first"
      }
    ],
    writeup: [
      "Main ICF-certified life coach hoon, lekin sabse pehle ek sunne wala insaan. Meri coaching mein na jargon hai, na masks. Sirf sachchi baatein, aur ek saaf process.",
      "Main aapse aage chalkar raasta nahi dikhata. Main aapke saath chalta hoon, taaki aap khud apna jawab dhoondh sako. Science-backed tools aur empathy, dono saath chalte hain.",
      "Har session ka maqsad ek hi hai: aap ek kadam zyada clear, zyada confident aur zyada apne jaise mehsoos karo."
    ],
    youtube: ["YOUR_YT_ID_1", "YOUR_YT_ID_2"],
    instagram: ["YOUR_IG_CODE_1", "YOUR_IG_CODE_2"]
  },

  human: {
    title: "HUMAN",
    bannerImage: null, // null defaults to the Human card photo
    quote: "Just real conversations.",
    facts: [
      {
        title: "Relatable approach",
        desc: "No jargon. No masks."
      },
      {
        title: "Why I do this",
        desc: "Kyunki kisi ne mere saath bhi chalna tha"
      }
    ],
    writeup: [
      "Uniform aur certificates ke peeche ek aam insaan hai, jise sunset dekhna, chhote sapne dekhna aur kabhi kabhi ruk jaana bhi pasand hai.",
      "Mujhe bhi doubt hue, thakaan hui, aur wo raaste bhi dekhe jahan lagta tha ki ab aage kuch nahi. Isi liye main relatable hoon. Main wahi hoon jo aap mehsoos kar rahe ho.",
      "Agar aap yahan tak aaye ho, to aapne pehla kadam le liya hai. Baaki baatein hum real conversation mein karenge."
    ],
    youtube: ["YOUR_YT_ID_1", "YOUR_YT_ID_2"],
    instagram: ["YOUR_IG_CODE_1", "YOUR_IG_CODE_2"]
  }
};
