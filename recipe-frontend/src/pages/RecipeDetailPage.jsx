import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  ChefHat,
  Clock3,
  Flame,
  Star,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import Navbar from "../components/Navbar";
import "./RecipeDetailPage.css";

/* ------------------------------------------------------------------ */
/*  Full recipe data — Nepal & India only                              */
/* ------------------------------------------------------------------ */
const RECIPES = [
  {
    id: 1,
    name: "Momo",
    description: "Steamed dumplings filled with spiced meat, served with fiery tomato achar.",
    longDescription:
      "Momo is Nepal's most beloved street food and home comfort dish. Thin dough wrappers are filled with a spiced mixture of minced buffalo or chicken, ginger, garlic, and cilantro, then folded into crescent or round shapes and steamed in bamboo baskets. The real magic is in the achar -- a blazing tomato-sesame dip that balances heat, tang, and umami. Every household has its own filling ratio and folding style, making each batch deeply personal.",
    chef: "Asha Tamang",
    chefId: "asha-tamang",
    chefSpecialty: "Nepali Home Cooking",
    chefInitials: "AT",
    chefVerified: true,
    origin: "Nepali",
    time: 40,
    level: "Medium",
    rating: 4.9,
    reviews: 214,
    servings: 4,
    calories: 320,
    image: "/images/recipes/momo.png",
    ingredients: [
      "2 cups all-purpose flour",
      "1/2 cup water (for dough)",
      "300g minced chicken or buffalo",
      "1 medium onion, finely chopped",
      "3 cloves garlic, minced",
      "1 inch ginger, grated",
      "2 tbsp soy sauce",
      "1 tsp black pepper",
      "Fresh cilantro, chopped",
      "Salt to taste",
      "Vegetable oil for greasing",
    ],
    steps: [
      "Mix flour and water to form a smooth dough. Cover and rest for 30 minutes.",
      "Combine minced meat, onion, garlic, ginger, soy sauce, pepper, cilantro, and salt. Mix thoroughly by hand.",
      "Roll dough into a long rope and divide into small balls. Roll each ball into a thin, round wrapper.",
      "Place a spoonful of filling in the centre of each wrapper. Fold and pleat the edges to seal tightly.",
      "Grease a steamer basket with oil. Arrange momos without touching. Steam over high heat for 12-15 minutes.",
      "Serve immediately with tomato achar on the side.",
    ],
    tips: [
      "Keep unused dough covered with a damp cloth to prevent drying.",
      "Do not overfill -- the wrappers will tear during steaming.",
      "For juicier momos, add a tablespoon of mustard oil to the filling.",
    ],
  },
  {
    id: 2,
    name: "Dal Bhat",
    description: "The daily staple -- lentils, rice, tarkari, and pickles on a brass thali.",
    longDescription:
      "Dal Bhat is the backbone of Nepali cuisine, eaten twice a day across the country. A complete thali includes steamed rice, a lentil soup seasoned with turmeric and cumin, a vegetable tarkari, and a sharp pickle or achar. The beauty of dal bhat is its simplicity and balance -- carbohydrates from rice, protein from lentils, and vitamins from seasonal vegetables, all in one brass plate.",
    chef: "Rajan Shrestha",
    chefId: "rajan-shrestha",
    chefSpecialty: "Nepali Street & Comfort Food",
    chefInitials: "RS",
    chefVerified: true,
    origin: "Nepali",
    time: 35,
    level: "Easy",
    rating: 4.8,
    reviews: 189,
    servings: 4,
    calories: 410,
    image: "/images/recipes/dal-bhat.png",
    ingredients: [
      "1 cup yellow lentils (masoor dal)",
      "2 cups basmati rice",
      "1 tsp turmeric powder",
      "1 tsp cumin seeds",
      "2 cloves garlic, minced",
      "1 inch ginger, grated",
      "2 medium tomatoes, chopped",
      "1 tbsp ghee",
      "Salt to taste",
      "Fresh cilantro for garnish",
      "Seasonal vegetables for tarkari",
    ],
    steps: [
      "Wash rice until water runs clear. Soak for 20 minutes, then cook in a 1:1.5 rice-to-water ratio.",
      "Wash lentils and boil with turmeric and salt until soft. Mash lightly for texture.",
      "Heat ghee in a small pan. Add cumin seeds and let them splutter.",
      "Add garlic and ginger, cook for 30 seconds. Add tomatoes and cook until soft.",
      "Pour the tempering over the cooked dal and stir. Adjust salt.",
      "Serve rice, dal, tarkari, and achar together on a thali.",
    ],
    tips: [
      "Use a pressure cooker for faster dal preparation.",
      "The tempering (tadka) is what brings the dal to life -- never skip it.",
      "Serve with a side of gundruk or fermented greens for authenticity.",
    ],
  },
  {
    id: 3,
    name: "Sel Roti",
    description: "Crispy ring-shaped rice bread, deep-fried for festivals and mornings.",
    longDescription:
      "Sel Roti is a traditional Nepali delicacy made from rice flour batter, shaped into rings and deep-fried to a golden crisp. It holds a special place during Dashain and Tihar festivals, where it is prepared in large batches and offered alongside other festive foods. The slight sweetness of the batter and the crunch of the exterior make sel roti a unique treat unlike any other bread in the region.",
    chef: "Asha Tamang",
    chefId: "asha-tamang",
    chefSpecialty: "Nepali Home Cooking",
    chefInitials: "AT",
    chefVerified: true,
    origin: "Nepali",
    time: 25,
    level: "Easy",
    rating: 4.6,
    reviews: 97,
    servings: 8,
    calories: 180,
    image: "/images/recipes/sel-roti.png",
    ingredients: [
      "3 cups rice flour",
      "1 cup sugar",
      "1/2 cup warm water",
      "1/4 cup ghee, melted",
      "1/2 tsp cardamom powder",
      "Oil for deep frying",
    ],
    steps: [
      "Mix rice flour and sugar in a large bowl.",
      "Gradually add warm water and melted ghee. Mix to a thick, pourable batter.",
      "Add cardamom powder and mix well. Rest the batter for 15 minutes.",
      "Heat oil in a deep pan over medium heat.",
      "Take a handful of batter and shape it into a ring by squeezing between thumb and forefinger directly into the oil.",
      "Fry until golden brown on both sides, turning once. Drain on paper towels.",
    ],
    tips: [
      "The batter should be thicker than pancake batter but still pourable.",
      "Maintain medium heat -- too hot and the outside burns before the inside cooks.",
      "Traditionally shaped by hand, but a piping bag also works.",
    ],
  },
  {
    id: 4,
    name: "Thukpa",
    description: "Warming noodle soup with vegetables and tender meat, highland comfort food.",
    longDescription:
      "Thukpa is a hearty noodle soup that originated in Tibet and became a staple in Nepal's highland regions. A fragrant broth simmered with garlic, ginger, and chilli is loaded with hand-pulled or machine-cut noodles, seasonal vegetables, and tender slices of chicken or mutton. It is the definitive cold-weather comfort food, served steaming hot with a squeeze of lime and a spoonful of chilli oil.",
    chef: "Rajan Shrestha",
    chefId: "rajan-shrestha",
    chefSpecialty: "Nepali Street & Comfort Food",
    chefInitials: "RS",
    chefVerified: true,
    origin: "Nepali",
    time: 45,
    level: "Easy",
    rating: 4.7,
    reviews: 132,
    servings: 3,
    calories: 290,
    image: "/images/recipes/thukpa.png",
    ingredients: [
      "200g egg noodles",
      "200g chicken or mutton, sliced thin",
      "1 medium onion, sliced",
      "2 cloves garlic, minced",
      "1 inch ginger, julienned",
      "1 carrot, julienned",
      "1 cup cabbage, shredded",
      "2 green chillies, slit",
      "4 cups chicken broth",
      "2 tbsp soy sauce",
      "1 tbsp vegetable oil",
      "Salt and pepper to taste",
      "Fresh cilantro, lime wedges for serving",
    ],
    steps: [
      "Boil noodles according to package, drain, and set aside.",
      "Heat oil in a deep pot. Saute onion until translucent.",
      "Add garlic, ginger, and green chillies. Cook for 1 minute.",
      "Add sliced meat and cook until browned on the edges.",
      "Pour in broth and soy sauce. Bring to a boil, then reduce heat and simmer for 15 minutes.",
      "Add carrots and cabbage. Cook for another 5 minutes.",
      "Divide noodles into bowls, ladle hot soup over them. Garnish with cilantro and serve with lime wedges.",
    ],
    tips: [
      "For richer broth, simmer chicken bones separately for an hour before using.",
      "Finish with a drizzle of Sichuan chilli oil for extra heat.",
      "Hand-pulled noodles give the best texture but dried noodles work well.",
    ],
  },
  {
    id: 5,
    name: "Butter Chicken",
    description: "Tender chicken in a rich, creamy tomato-cashew gravy with warm spice.",
    longDescription:
      "Butter Chicken -- Murgh Makhani -- was born in Delhi's Moti Mahal restaurant in the 1950s, but it has become one of India's most recognised dishes worldwide. Tandoori-cooked chicken is simmered in a velvety gravy of pureed tomatoes, cashews, cream, and a careful blend of garam masala. The sauce should be silky, mildly sweet, and deeply aromatic without overwhelming heat. It is best enjoyed with butter naan or steamed basmati.",
    chef: "Priya Sharma",
    chefId: "priya-sharma",
    chefSpecialty: "North Indian Classics",
    chefInitials: "PS",
    chefVerified: true,
    origin: "Indian",
    time: 50,
    level: "Medium",
    rating: 4.9,
    reviews: 301,
    servings: 4,
    calories: 490,
    image: "/images/recipes/butter-chicken.png",
    ingredients: [
      "500g chicken thighs, boneless",
      "1 cup yoghurt",
      "2 tsp garam masala",
      "1 tsp turmeric",
      "1 tsp chilli powder",
      "4 large tomatoes, pureed",
      "10 cashews, soaked and ground",
      "2 tbsp butter",
      "1 tbsp oil",
      "1 inch ginger-garlic paste",
      "1/2 cup heavy cream",
      "1 tsp sugar",
      "1 tsp dried fenugreek leaves (kasuri methi)",
      "Salt to taste",
    ],
    steps: [
      "Marinate chicken in yoghurt, garam masala, turmeric, chilli, and salt. Refrigerate for at least 1 hour.",
      "Grill or pan-sear marinated chicken in oil until charred edges form. Set aside.",
      "In the same pan, melt butter. Add ginger-garlic paste and cook until fragrant.",
      "Add tomato puree and cook on medium heat for 12-15 minutes until oil separates.",
      "Stir in cashew paste, sugar, and salt. Simmer for 5 minutes.",
      "Add the cooked chicken pieces. Stir gently and cook for 8 minutes.",
      "Finish with cream and crushed kasuri methi. Stir and remove from heat. Serve with naan.",
    ],
    tips: [
      "Longer marination makes the chicken more tender and flavourful.",
      "Strain the tomato sauce through a mesh for restaurant-quality smoothness.",
      "Kasuri methi at the end is non-negotiable -- it defines the flavour.",
    ],
  },
  {
    id: 6,
    name: "Masala Dosa",
    description: "Crispy fermented crepe filled with spiced potato, served with sambar and chutney.",
    longDescription:
      "Masala Dosa is a South Indian masterpiece -- a paper-thin, golden crepe made from a fermented rice and urad dal batter, filled with a mildly spiced potato filling. The fermentation gives the dosa its distinctive tang and crisp texture. It is always accompanied by coconut chutney and a bowl of hot sambar. Making dosa batter from scratch requires patience, but the result is incomparably better than any pre-mix.",
    chef: "Arjun Nair",
    chefId: "arjun-nair",
    chefSpecialty: "South Indian & Vegetarian",
    chefInitials: "AN",
    chefVerified: true,
    origin: "Indian",
    time: 30,
    level: "Medium",
    rating: 4.8,
    reviews: 178,
    servings: 4,
    calories: 260,
    image: "/images/recipes/masala-dosa.png",
    ingredients: [
      "2 cups rice",
      "1/2 cup urad dal",
      "1/4 tsp fenugreek seeds",
      "Salt to taste",
      "4 medium potatoes, boiled and mashed",
      "1 onion, sliced",
      "1 tsp mustard seeds",
      "8-10 curry leaves",
      "2 green chillies, slit",
      "1/2 tsp turmeric",
      "Oil for cooking",
    ],
    steps: [
      "Soak rice and urad dal with fenugreek seeds separately for 6 hours. Grind to a smooth batter, mix, salt, and ferment overnight.",
      "For the filling, heat oil and splutter mustard seeds. Add curry leaves, chillies, and onion. Cook until soft.",
      "Add turmeric and mashed potatoes. Mix well and season with salt.",
      "Heat a flat pan (tawa). Pour a ladleful of batter and spread in a thin circle.",
      "Drizzle oil around the edges. Cook until the bottom is golden and crisp.",
      "Place a line of potato filling in the centre and fold the dosa over. Serve with coconut chutney and sambar.",
    ],
    tips: [
      "Good fermentation is key -- the batter should double in volume and smell slightly sour.",
      "The tawa must be hot, then add batter quickly and spread in one motion.",
      "Use a well-seasoned cast iron tawa for the best results.",
    ],
  },
  {
    id: 7,
    name: "Hyderabadi Biryani",
    description: "Layered saffron rice and slow-cooked meat sealed in dum, fragrant and bold.",
    longDescription:
      "Hyderabadi Biryani is the crown jewel of Indian rice dishes. Layers of partially cooked basmati rice and richly marinated, slow-cooked mutton or chicken are sealed together in a heavy-bottomed pot (handi) and cooked on dum -- a slow, trapped-steam technique. Saffron milk, fried onions, and fresh mint are layered between the rice and meat. The result is a dish where every grain of rice carries flavour, and the meat falls off the bone.",
    chef: "Priya Sharma",
    chefId: "priya-sharma",
    chefSpecialty: "North Indian Classics",
    chefInitials: "PS",
    chefVerified: true,
    origin: "Indian",
    time: 75,
    level: "Hard",
    rating: 5.0,
    reviews: 256,
    servings: 6,
    calories: 580,
    image: "/images/recipes/biryani.png",
    ingredients: [
      "500g mutton or chicken, on the bone",
      "2 cups basmati rice, soaked 30 min",
      "1 cup yoghurt",
      "3 large onions, thinly sliced and fried",
      "1/4 cup warm milk + pinch of saffron",
      "2 tbsp biryani masala",
      "1 tsp red chilli powder",
      "1 inch ginger-garlic paste",
      "Fresh mint and cilantro leaves",
      "3 tbsp ghee",
      "Whole spices: bay leaf, cardamom, cloves, cinnamon",
      "Salt to taste",
      "Dough for sealing (atta + water)",
    ],
    steps: [
      "Marinate meat in yoghurt, biryani masala, chilli powder, ginger-garlic paste, half the fried onions, and salt for 2 hours.",
      "Parboil rice with whole spices until 70% cooked. Drain.",
      "In a heavy handi, layer marinated meat at the bottom.",
      "Add a layer of parboiled rice. Sprinkle fried onions, mint, cilantro, saffron milk, and ghee.",
      "Repeat layers. Seal the lid with dough to trap steam.",
      "Cook on high heat for 5 minutes, then reduce to the lowest flame for 40 minutes (dum).",
      "Break the seal, gently mix the layers, and serve.",
    ],
    tips: [
      "Never skip the dough seal -- enclosed steam is what makes biryani special.",
      "Do not fully cook the rice before layering, it finishes in the dum.",
      "Rest for 5 minutes after opening before serving for the flavours to settle.",
    ],
  },
  {
    id: 8,
    name: "Palak Paneer",
    description: "Soft paneer in a velvety spinach gravy, earthy and nourishing.",
    longDescription:
      "Palak Paneer is a North Indian vegetarian classic that turns simple spinach into a rich, creamy dish. Fresh spinach is blanched, pureed, and cooked with onion, tomato, and warm spices to create a vibrant green gravy. Cubes of paneer (Indian cottage cheese) are gently folded in at the end, absorbing the earthy flavours. The dish is finished with a swirl of cream and a pinch of garam masala. Best served with roti or jeera rice.",
    chef: "Arjun Nair",
    chefId: "arjun-nair",
    chefSpecialty: "South Indian & Vegetarian",
    chefInitials: "AN",
    chefVerified: true,
    origin: "Indian",
    time: 35,
    level: "Easy",
    rating: 4.7,
    reviews: 144,
    servings: 3,
    calories: 340,
    image: "/images/recipes/palak-paneer.png",
    ingredients: [
      "300g fresh spinach",
      "200g paneer, cubed",
      "1 large onion, chopped",
      "2 tomatoes, chopped",
      "3 cloves garlic",
      "1 inch ginger",
      "2 green chillies",
      "1 tsp cumin seeds",
      "1/2 tsp garam masala",
      "2 tbsp cream",
      "1 tbsp butter",
      "Salt to taste",
    ],
    steps: [
      "Blanch spinach in boiling water for 2 minutes, then plunge into ice water. Drain and puree with green chillies.",
      "Heat butter in a pan. Add cumin seeds and let them splutter.",
      "Add chopped onion and cook until golden. Add ginger-garlic and cook for 1 minute.",
      "Add tomatoes and cook until soft and oil separates.",
      "Pour in the spinach puree. Stir and cook for 5-7 minutes on medium heat.",
      "Add paneer cubes and garam masala. Cook gently for 3 minutes.",
      "Finish with cream, adjust salt, and serve hot with roti.",
    ],
    tips: [
      "Ice-bath blanching keeps the spinach bright green.",
      "Lightly pan-fry paneer cubes before adding for a firmer texture.",
      "Do not overcook the spinach puree or it will lose its colour.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function RecipeDetailPage() {
  const { id } = useParams();

  const recipe = useMemo(
    () => RECIPES.find((r) => String(r.id) === id),
    [id]
  );

  if (!recipe) {
    return (
      <div className="rd-root">
        <Navbar activeItem="Recipes" />
        <main className="rd-not-found">
          <h1 className="rd-not-found-title">Recipe not found</h1>
          <p className="rd-not-found-sub">
            The recipe you are looking for does not exist.
          </p>
          <Link to="/recipes" className="rd-not-found-link">
            <ArrowLeft className="rd-back-icon" />
            Back to recipes
          </Link>
        </main>
      </div>
    );
  }

  const levelClass =
    recipe.level === "Easy"
      ? "rd-level-easy"
      : recipe.level === "Medium"
        ? "rd-level-medium"
        : "rd-level-hard";

  return (
    <div className="rd-root">
      <Navbar activeItem="Recipes" />

      {/* ============================================================ */}
      {/*  Hero image band                                             */}
      {/* ============================================================ */}
      <section className="rd-hero">
        <div className="rd-hero-bg">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="rd-hero-bg-img"
          />
          <div className="rd-hero-overlay" />
        </div>

        <div className="rd-hero-inner">
          <Link to="/recipes" className="rd-back">
            <ArrowLeft className="rd-back-icon" />
            All Recipes
          </Link>

          <div className="rd-hero-content">
            <span className="rd-hero-origin">{recipe.origin}</span>
            <h1 className="rd-hero-title">{recipe.name}</h1>
            <p className="rd-hero-desc">{recipe.description}</p>

            <div className="rd-hero-meta">
              <span className="rd-hero-meta-item">
                <Clock3 className="rd-hero-meta-icon" />
                {recipe.time} min
              </span>
              <span className={`rd-hero-meta-item rd-hero-level ${levelClass}`}>
                <Flame className="rd-hero-meta-icon" />
                {recipe.level}
              </span>
              <span className="rd-hero-meta-item">
                <Users className="rd-hero-meta-icon" />
                {recipe.servings} servings
              </span>
              <span className="rd-hero-meta-item">
                <Star className="rd-hero-meta-star" />
                {recipe.rating}
                <span className="rd-hero-reviews">({recipe.reviews})</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Content                                                     */}
      {/* ============================================================ */}
      <main className="rd-main">
        <div className="rd-container">
          <div className="rd-layout">
            {/* ---- Left column: recipe body ---- */}
            <div className="rd-body">
              {/* About */}
              <section className="rd-section">
                <h2 className="rd-section-title">About this dish</h2>
                <p className="rd-section-text">{recipe.longDescription}</p>
              </section>

              {/* Ingredients */}
              <section className="rd-section">
                <h2 className="rd-section-title">Ingredients</h2>
                <ul className="rd-ingredients">
                  {recipe.ingredients.map((item, i) => (
                    <li key={i} className="rd-ingredient">
                      <span className="rd-ingredient-dot" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Steps */}
              <section className="rd-section">
                <h2 className="rd-section-title">Instructions</h2>
                <ol className="rd-steps">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="rd-step">
                      <span className="rd-step-num">{i + 1}</span>
                      <p className="rd-step-text">{step}</p>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Tips */}
              {recipe.tips && recipe.tips.length > 0 && (
                <section className="rd-section rd-tips-section">
                  <h2 className="rd-section-title">Chef's Tips</h2>
                  <ul className="rd-tips">
                    {recipe.tips.map((tip, i) => (
                      <li key={i} className="rd-tip">{tip}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* ---- Right column: chef sidebar ---- */}
            <aside className="rd-sidebar">
              {/* Quick facts */}
              <div className="rd-sidebar-card">
                <p className="rd-sidebar-card-label">Quick Facts</p>
                <div className="rd-quick-facts">
                  <div className="rd-fact">
                    <Clock3 className="rd-fact-icon" />
                    <div>
                      <p className="rd-fact-value">{recipe.time} min</p>
                      <p className="rd-fact-label">Cook time</p>
                    </div>
                  </div>
                  <div className="rd-fact">
                    <Users className="rd-fact-icon" />
                    <div>
                      <p className="rd-fact-value">{recipe.servings}</p>
                      <p className="rd-fact-label">Servings</p>
                    </div>
                  </div>
                  <div className="rd-fact">
                    <Flame className="rd-fact-icon" />
                    <div>
                      <p className="rd-fact-value">{recipe.calories}</p>
                      <p className="rd-fact-label">Calories</p>
                    </div>
                  </div>
                  <div className="rd-fact">
                    <UtensilsCrossed className="rd-fact-icon" />
                    <div>
                      <p className="rd-fact-value">{recipe.level}</p>
                      <p className="rd-fact-label">Difficulty</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chef card */}
              <div className="rd-sidebar-card rd-chef-card">
                <p className="rd-sidebar-card-label">Recipe by</p>
                <div className="rd-chef-top">
                  <div className="rd-chef-avatar-wrap">
                    <div className="rd-chef-avatar">{recipe.chefInitials}</div>
                    {recipe.chefVerified && (
                      <span className="rd-chef-badge">
                        <BadgeCheck className="rd-chef-badge-icon" />
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="rd-chef-name">{recipe.chef}</p>
                    <p className="rd-chef-specialty">{recipe.chefSpecialty}</p>
                  </div>
                </div>
                <Link to="/chefs" className="rd-chef-link">
                  <BookOpen className="rd-chef-link-icon" />
                  View Chef Profile
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="rd-footer">
        <div className="rd-footer-inner">
          <p className="rd-footer-brand">
            Recipe<span className="rd-footer-accent">Nest</span>
          </p>
          <p className="rd-footer-copy">RecipeNest&trade;</p>
        </div>
      </footer>
    </div>
  );
}
