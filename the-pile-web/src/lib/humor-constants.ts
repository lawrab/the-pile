/**
 * Humor constants and rotating text for The Pile
 * Centralized location for all humorous and rotating content
 * Theme: Gaming backlog confession booth with Steam-specific humor
 */

// Shame level rankings based on score ranges
export const SHAME_RANKINGS = [
  { min: 0, max: 50, level: "Innocent", description: "A reasonable relationship with your backlog" },
  { min: 50, max: 100, level: "Casual Collector", description: "You like having options 'just in case'" },
  { min: 100, max: 200, level: "Serial Buyer", description: "Steam sales are your weakness" },
  { min: 200, max: 400, level: "Pile Builder", description: "Your backlog has achieved structural integrity" },
  { min: 400, max: Infinity, level: "The Pile Master", description: "Your pile is visible from space" }
]

// Taglines and subtitles (rotate randomly)
export const TAGLINES = [
  "The brutally honest Steam backlog tracker that turns your shame into insights",
  "Face your digital hoarding habits with data-driven honesty",
  "Your Steam library's confession booth",
  "Where unplayed games go to be acknowledged", 
  "Quantifying gaming guilt since 2024",
  "The therapeutic approach to backlog shame",
  "Turning your Steam addiction into self-awareness",
  "Where gaming regrets become gentle acceptance",
  "Your pile's judgment-free sanctuary",
  "The digital detox you didn't know you needed"
]

// Motivational/humorous messages for different pile sizes
export const PILE_MESSAGES = {
  empty: [
    "Your pile is empty. Are you even a real gamer?",
    "No backlog? That's suspicious...",
    "A clean pile. Almost too clean.",
    "Either you're a gaming saint or you haven't discovered Steam sales yet.",
    "Suspicious lack of unplayed games detected.",
    "Your self-control is concerning the Steam algorithm.",
    "We've never seen this before. Scientists want to study you.",
    "Are you sure you connected the right Steam account?",
    "This emptiness is beautiful yet terrifying.",
    "You've achieved what we thought impossible.",
    "Your discipline makes other gamers weep.",
    "The pile is empty, but your heart isn't."
  ],
  small: [
    "A manageable pile. There's still hope.",
    "You can actually finish these... probably.",
    "Not bad! You might see the end of this.",
    "Your pile has room to breathe.",
    "Still in the realm of human possibility.",
    "Other gamers are quietly envious of your restraint.",
    "A cozy little collection of future adventures.",
    "You could realistically play all of these... someday.",
    "The pile whispers rather than screams.",
    "Your backlog has a healthy glow.",
    "Perfectly curated procrastination.",
    "Small but mighty - like your gaming ambitions.",
    "The Goldilocks zone of gaming backlogs.",
    "You're playing life on easy mode.",
    "This pile sparks joy... and mild anxiety."
  ],
  medium: [
    "The pile grows. The guilt deepens.",
    "Starting to look like a real collection.",
    "You're entering dangerous territory.",
    "The pile begins to develop its own personality.",
    "Your wishlist and your wallet had a conversation.",
    "Houston, we have a backlog problem.",
    "The pile is becoming self-aware.",
    "You've crossed the point of no return.",
    "Your games are starting to judge each other.",
    "The pile has achieved critical thinking.",
    "Steam sales have left their mark on your soul.",
    "Your backlog is entering its rebellious phase.",
    "The pile demands respect and maybe therapy.",
    "You're in too deep, but the water's warm.",
    "Your collection has developed trust issues.",
    "The pile is writing its own origin story.",
    "Welcome to the middle circle of gaming hell.",
    "Your backlog has started a support group."
  ],
  large: [
    "Your pile has achieved critical mass.",
    "Even Steam is worried about you.",
    "This is no longer a backlog, it's a lifestyle.",
    "Your pile could qualify for statehood.",
    "The pile has developed its own weather patterns.",
    "Your backlog is visible from the International Space Station.",
    "NASA wants to name a crater after your pile.",
    "Your collection has achieved escape velocity.",
    "The pile has started charging rent.",
    "Your backlog is studying for its PhD in Procrastination.",
    "Steam created a new server just for your library.",
    "Your pile has been classified as a renewable resource.",
    "The UN is considering your backlog for World Heritage status.",
    "Your collection has formed its own civilization.",
    "The pile has started a newsletter.",
    "Your backlog is teaching a masterclass in patience.",
    "Even your unplayed games have unplayed games.",
    "Your pile has developed Stockholm syndrome.",
    "The backlog has become the main log.",
    "Your collection is auditioning for its own documentary."
  ],
  massive: [
    "Your pile needs its own zip code.",
    "Archaeologists will study this someday.",
    "You've transcended mere collecting.",
    "Your pile has achieved consciousness and started a blog.",
    "The Library of Alexandria weeps in comparison.",
    "Your backlog requires its own postal service.",
    "Scientists are studying your pile for renewable energy.",
    "Your collection has developed its own dialect.",
    "The pile has formed a union and demands better working conditions.",
    "Your backlog is teaching courses at the local university.",
    "Steam's servers bow down to your magnificent pile.",
    "Your collection has been featured in National Geographic.",
    "The pile has started its own streaming service.",
    "Your backlog is running for political office.",
    "The UN has classified your pile as a new form of matter.",
    "Your collection has achieved immortality.",
    "The pile has written its autobiography.",
    "Your backlog is consulting for NASA on deep space storage.",
    "The pile has developed its own cryptocurrency.",
    "Your collection is being studied by philosophers.",
    "The backlog has transcended physical reality.",
    "Your pile exists in multiple dimensions simultaneously."
  ]
}

// Amnesty reasons (for random suggestions) - dramatically expanded
export const AMNESTY_REASONS = [
  // Classic excuses
  "It was on sale and I was weak",
  "Looked good in 2015",
  "Friend said it was amazing (they lied)",
  "Bundle filler - never wanted it",
  "The reviews were misleading",
  "My tastes have evolved",
  "Life's too short for this",
  "Making room for games I'll actually play",
  "Spring cleaning (in December)",
  "Accepting who I really am",
  
  // Steam-specific scenarios
  "Got it in a Humble Bundle for the one game I wanted",
  "Steam Summer Sale claimed another victim",
  "Bought it during a mental breakdown",
  "The trailer was better than the game",
  "My younger self had terrible judgment",
  "It looked different in the screenshots",
  "I was going through a phase",
  "The developer abandoned it anyway",
  "My computer can't even run it",
  "I bought it to support the developer (I'm a good person)",
  
  // Gaming culture references
  "Early Access was a mistake",
  "The hype train derailed",
  "My backlog has commitment issues",
  "I'm not the same gamer I was in 2018",
  "The achievement list scared me away",
  "I realized I'm not a completionist",
  "My attention span has evolved",
  "The tutorial was 3 hours long",
  "I bought it for multiplayer, friends moved on",
  "The mods were better than the base game",
  
  // Self-reflection
  "I was collecting games, not playing them",
  "My wallet made decisions my heart couldn't keep",
  "I confused 'wanting to play' with 'wanting to own'",
  "I was addicted to the purchase, not the game",
  "My Steam library is not a museum",
  "I give myself permission to have changed",
  "Not every game is meant for every gamer",
  "I choose peace over completionist anxiety",
  "My time is more valuable than my completion rate",
  "I forgive my past gaming decisions",
  
  // Humorous excuses
  "It was a gift to my future self (ungrateful)",
  "I bought it when cryptocurrency made me feel rich",
  "Pandemic purchasing was a dark time",
  "I thought I'd become a different person",
  "My wishlist became a bucket list became a regret list",
  "I was young and full of hopes and dreams",
  "The game and I were never meant to be",
  "I'm releasing it back into the digital wild",
  "My pile needed a reality check",
  "Even my other games think this one's weird"
]

// Pattern detection insights - greatly expanded
export const BEHAVIORAL_INSIGHTS = {
  saleAddict: [
    "You buy {percentage}% of your games during sales",
    "Steam sales trigger your fight-or-buy response", 
    "Your wallet cries during every seasonal sale",
    "You've never paid full price for anything",
    "Your purchase history reads like a Steam sale timeline",
    "You treat Steam sales like a competitive sport",
    "Your credit card has PTSD from summer sales",
    "You buy more games during sales than you play all year",
    "Sales make you forget you already own {count} unplayed games",
    "You've achieved advanced-level sale addiction"
  ],
  genreHoarder: [
    "You buy {genre} games but rarely play them",
    "Your {genre} completion rate is {rate}%",
    "{count} {genre} games remain untouched",
    "You have a thing for {genre} games but commitment issues",
    "Your {genre} collection suggests an identity crisis",
    "You're a {genre} collector, not a {genre} player",
    "You've cornered the market on unplayed {genre} games",
    "Your {genre} games are starting a support group",
    "You buy {genre} games like they're going extinct"
  ],
  serialStarter: [
    "You've started {count} games but finished {finished}",
    "Your completion rate suggests commitment issues",
    "You have a pattern of 2-hour abandonment",
    "You collect first hours like Pokemon cards",
    "Your games know they're on borrowed time",
    "You're a professional tutorial completionist",
    "You've mastered the art of the gaming one-night stand",
    "Your save files are a graveyard of good intentions",
    "You start more games than a casino dealer",
    "Your gaming pattern is 'arrive, try, abandon, repeat'"
  ],
  patientGamer: [
    "You buy games years after release",
    "Your average purchase is {years} years post-launch",
    "Patient gaming or procrastination?",
    "You let others beta test games for you",
    "Your library is a vintage gaming collection",
    "You buy games when they're old enough to vote",
    "You're so patient, developers send thank-you cards",
    "Your timing is impeccable... if you were living in the past",
    "You've achieved legendary patience levels"
  ],
  bundleAddict: [
    "You own {count} games from bundles you bought for one title",
    "Bundles are your weakness - {percentage}% of your library",
    "You've never met a bundle you didn't like",
    "Your library is {percentage}% bundle overflow",
    "Bundles have taken over your digital life",
    "You buy bundles like they're going out of style",
    "Bundle deals cloud your judgment worse than Steam sales"
  ],
  achievementHunter: [
    "You have {count} games with 0% achievements",
    "Your achievement rate suggests selective hunting",
    "You hunt achievements like a digital trophy collector",
    "Your achievement completion rate is {rate}% - room for improvement",
    "Some games exist solely for their achievement lists",
    "You've mastered the art of achievement window shopping"
  ],
  wishlistHoarder: [
    "Your wishlist has {count} items - that's not shopping, that's collecting",
    "You treat your wishlist like a second library",
    "Your wishlist is longer than most novels",
    "You add games to your wishlist faster than you remove them",
    "Your wishlist has achieved sentience",
    "You wishlist games like you're preparing for digital apocalypse"
  ],
  earlyAccessGambler: [
    "You own {count} Early Access games in permanent development",
    "Early Access is where your hope goes to die slowly",
    "You're funding more games than a venture capitalist",
    "Your Early Access collection is a lesson in optimism",
    "You bet on Early Access like it's cryptocurrency"
  ]
}

// Time estimation messages - expanded
export const TIME_MESSAGES = {
  reasonable: [
    "{time} hours - totally doable!",
    "Only {time} hours to freedom",
    "{time} hours of adventure await",
    "{time} hours - perfect for a long weekend",
    "A mere {time} hours stands between you and victory",
    "{time} hours - your future self will thank you",
    "Just {time} hours of commitment required",
    "{time} hours - that's like binge-watching a good series"
  ],
  challenging: [
    "{time} hours - better get started",
    "{time} hours - hope you're immortal", 
    "{time} hours - see you in {years} years",
    "{time} hours - cancel your social plans",
    "{time} hours - time to call in sick",
    "{time} hours - your loved ones will miss you",
    "{time} hours - that's a part-time job",
    "{time} hours - better than a college degree"
  ],
  impossible: [
    "{time} hours - mathematically impossible",
    "{time} hours - even AI can't help you",
    "{time} hours - your grandchildren might finish",
    "{time} hours - requires multiple lifetimes",
    "{time} hours - challenge accepted by nobody",
    "{time} hours - NASA's planning shorter missions",
    "{time} hours - the universe will end first",
    "{time} hours - abandon all hope"
  ]
}

// Loading messages - confession booth themed
export const LOADING_MESSAGES = [
  // Original ones
  "Calculating your shame...",
  "Judging your choices...", 
  "Counting unplayed games...",
  "Measuring the pile...",
  "Importing questionable decisions...",
  "Analyzing buying patterns...",
  "Quantifying regret...",
  
  // Confession booth theme
  "Preparing the confession booth...",
  "Lighting the candles of truth...",
  "Unlocking the chamber of gaming secrets...",
  "Consulting the oracle of unplayed games...",
  "Reading the tea leaves of your purchase history...",
  "Channeling the spirits of abandoned saves...",
  "Deciphering the hieroglyphs of your Steam library...",
  "Awakening the ancient algorithms...",
  "Summoning the ghosts of sales past...",
  "Translating your digital regrets...",
  
  // Steam-specific
  "Downloading your digital sins...",
  "Synchronizing with Steam's judgment servers...",
  "Calculating your sale damage...",
  "Processing bundle overflow...",
  "Analyzing wishlist psychology...",
  "Evaluating achievement commitment...",
  "Measuring completion anxiety...",
  "Assessing backlog trauma...",
  "Computing procrastination patterns...",
  "Indexing your gaming denial...",
  
  // Therapeutic tone
  "Creating a safe space for your gaming truth...",
  "Preparing your personalized intervention...",
  "Building bridges to digital acceptance...",
  "Crafting your path to gaming enlightenment...",
  "Assembling your pile rehabilitation program...",
  "Designing your backlog therapy session...",
  "Constructing your gaming reality check...",
  "Weaving the narrative of your digital journey..."
]

// Error messages with humor - expanded
export const ERROR_MESSAGES = {
  steamDown: [
    "Steam is down. Even they need a break from your library.",
    "Steam's servers are hiding from your pile.",
    "Steam took one look at your backlog and went offline.",
    "The Steam servers are processing their own digital shame."
  ],
  importFailed: [
    "Import failed. Your pile was too heavy.",
    "Your library broke our import system.",
    "Import failed - we're not equipped for this level of backlog.",
    "Your collection crashed our confession booth."
  ],
  networkError: [
    "Connection lost. The pile remains.",
    "Network error: Reality couldn't handle your backlog.",
    "Connection failed - your pile exists beyond the internet.",
    "Network timeout: Your library transcends digital boundaries."
  ],
  unauthorized: [
    "Please log in to face your shame.",
    "Access denied until you're ready for the truth.",
    "Login required to enter the confession booth.",
    "Authentication needed for this level of digital honesty."
  ],
  rateLimit: [
    "Slow down! Even confession needs pacing.",
    "Rate limited: Your enthusiasm is overwhelming our servers.",
    "Easy there, champion. Rome wasn't built in a day.",
    "Pump the brakes - good therapy takes time."
  ]
}

// Achievement-style messages for milestones - expanded
export const MILESTONES = {
  firstAmnesty: [
    "First Amnesty - The healing begins",
    "Baby Steps - Your first act of digital mercy",
    "The Journey Starts - One game released into the wild",
    "Breaking the Seal - Your pile rehabilitation has begun"
  ],
  tenAmnesty: [
    "Serial Forgiver - 10 games released",
    "Double Digits - You're getting the hang of letting go",
    "The Purge Begins - 10 games have found peace",
    "Digital Declutterer - Making room for what matters"
  ],
  hundredGames: [
    "Collector - 100 game milestone",
    "Century Club - Your pile has reached legendary status",
    "Triple Digits - Welcome to the big leagues",
    "Centurion - Master of the hundred-game hoard"
  ],
  thousandGames: [
    "Digital Dragon - Hoarding level 1000",
    "The Thousand-Game Stare - You've seen things",
    "Kilogamer - 1000 games and counting",
    "Legendary Hoarder - Your pile defies physics"
  ],
  zeroBacklog: [
    "The Impossible - Backlog cleared",
    "Gaming Nirvana - You have achieved the impossible",
    "Backlog Zero - Scientists want to study you",
    "The Chosen One - You've broken the system"
  ],
  oneYearMember: [
    "Pile Veteran - One year of honesty",
    "Anniversary - 365 days of digital truth",
    "Seasoned Confessor - A year in the booth",
    "Time Served - One year of pile management"
  ],
  firstCompletion: [
    "Game Finisher - You actually completed something",
    "Miracle Worker - A game has been conquered",
    "Completion Confirmed - Breaking the abandonment cycle",
    "Achievement Unlocked: Actually Finishing Games"
  ],
  steamSaleResistance: [
    "Sale Survivor - You resisted a Steam sale",
    "Wallet Warrior - Your credit card thanks you",
    "Sales Immunity - You've developed resistance",
    "Iron Will - The sale called, you didn't answer"
  ]
}

// CTA (Call-to-action) variations - expanded
export const CTA_TEXTS = {
  login: [
    "Start Your Confession",
    "Face The Pile", 
    "Begin the Reckoning",
    "Confront Your Library",
    "Login with Steam",
    "Enter the Booth",
    "Accept Your Truth",
    "Embrace the Shame",
    "Unlock Your Secrets",
    "Begin Your Journey",
    "Step Into the Light",
    "Open Your Heart",
    "Confess Your Sins",
    "Start the Healing"
  ],
  amnesty: [
    "Grant Amnesty",
    "Let It Go",
    "Release This Game", 
    "Set It Free",
    "Time to Move On",
    "Grant Forgiveness",
    "Show Mercy",
    "End the Suffering",
    "Break the Chains",
    "Give It Peace",
    "Set It Free",
    "Release Into the Wild",
    "Grant Digital Mercy",
    "Declare Independence"
  ],
  analyze: [
    "Analyze My Shame",
    "Calculate the Damage",
    "Show Me the Truth",
    "Reveal My Patterns", 
    "Quantify My Guilt",
    "Expose My Secrets",
    "Uncover the Reality",
    "Decode My Behavior",
    "Illuminate the Pile",
    "Dissect My Choices",
    "Probe My Psychology",
    "Map My Gaming Soul"
  ]
}

// Stats descriptions - expanded with more personality
export const STAT_DESCRIPTIONS = {
  shameScore: [
    "Your quantified digital guilt",
    "The mathematical weight of your choices", 
    "Your pile's judgment rendered in numbers",
    "The algorithm's assessment of your gaming soul"
  ],
  unplayedCount: [
    "Games you'll never touch",
    "Digital orphans seeking attention",
    "The mountain of good intentions",
    "Your collection of someday-maybes"
  ],
  moneyWasted: [
    "Investment in false hope",
    "The cost of optimistic purchasing",
    "Your tribute to the Steam economy", 
    "Money that bought dreams, not gameplay"
  ],
  timeNeeded: [
    "Hours until freedom",
    "The lifetime commitment required",
    "Your temporal debt to the pile",
    "Time owed to your digital promises"
  ],
  completionRate: [
    "Your follow-through percentage",
    "The gap between ambition and reality",
    "Your commitment accountability score",
    "The brutal honesty metric"
  ],
  avgPlaytime: [
    "Average before abandonment",
    "Your attention span in minutes",
    "The typical relationship duration",
    "Time invested before digital divorce"
  ],
  oldestUnplayed: [
    "Your most patient purchase",
    "The vintage game still waiting",
    "Your longest-standing disappointment",
    "The game with the most seniority"
  ]
}

// New category: Genre-specific humor
export const GENRE_HUMOR = {
  rpg: [
    "You buy 100+ hour epics like you have infinite time",
    "Your RPG collection could outlive civilizations",
    "You collect character creation screens",
    "You're allergic to saving the world, apparently"
  ],
  simulation: [
    "You simulate everything except actually playing games",
    "Your life simulation games have more structure than your actual life",
    "You own more farms than actual farmers",
    "You've built more cities than urban planners"
  ],
  strategy: [
    "You plan to conquer worlds but can't conquer your backlog",
    "Your strategy games need a strategy to get played",
    "You're a tactical genius at buying, not playing",
    "You've won more wars in purchase than in gameplay"
  ],
  indie: [
    "You support indie developers better than their families do",
    "Your indie collection is a museum of artistic ambition",
    "You collect pixel art like it's going extinct",
    "You're keeping the indie scene alive through pure purchasing power"
  ]
}

// New category: Seasonal Steam sale humor
export const SEASONAL_HUMOR = {
  summer: [
    "Summer Sale Survivor: You bought games faster than sunshine",
    "Your summer was spent indoors shopping for games",
    "You harvested Steam deals instead of vitamin D",
    "Summer Sale PTSD: Your wallet still twitches"
  ],
  winter: [
    "Winter Sale Warrior: You conquered discounts, not games",
    "Your hibernation involved purchasing, not playing",
    "You stockpiled games like a digital prepper",
    "Winter Sale Champion: Bought enough games to last until spring"
  ],
  autumn: [
    "Autumn Sale Addict: You fell for every falling price",
    "Your leaves weren't the only things falling",
    "Halloween Sale Horror: Your credit card saw things",
    "You gathered games like a digital squirrel"
  ]
}

// Helper function to get random item from array
export function getRandomItem<T>(items: T[]): T {
  if (!items || items.length === 0) {
    throw new Error('Cannot get random item from empty array')
  }
  return items[Math.floor(Math.random() * items.length)]
}

// Helper function to get shame ranking
export function getShameRanking(score: number) {
  return SHAME_RANKINGS.find(rank => score >= rank.min && score < rank.max) || SHAME_RANKINGS[SHAME_RANKINGS.length - 1]
}

// Helper function to format insight with variables
export function formatInsight(template: string, variables: Record<string, any>): string {
  return template.replace(/{(\w+)}/g, (match, key) => variables[key] || match)
}

// Helper function to get random item from nested arrays (for error messages, etc.)
export function getRandomNestedItem<T>(items: T[] | T[][]): T {
  if (Array.isArray(items[0])) {
    const flatItems = (items as T[][]).flat()
    return getRandomItem(flatItems)
  }
  return getRandomItem(items as T[])
}