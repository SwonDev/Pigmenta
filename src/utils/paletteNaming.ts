import type { ColorShade, ColorValue } from '../types';

// Base de datos de nombres creativos categorizados
const PALETTE_NAMES = {
  // Nombres basados en hue (matiz) - MÁXIMA EXPANSIÓN
  hue: {
    red: [
      'Crimson Dreams', 'Ruby Whispers', 'Scarlet Symphony', 'Cherry Blossom', 'Sunset Ember', 'Rose Garden', 'Burgundy Velvet', 'Coral Reef',
      'Cardinal Fire', 'Strawberry Fields', 'Pomegranate Burst', 'Brick Harmony', 'Wine Cellar', 'Poppy Meadow', 'Cranberry Crush', 'Mahogany Depths',
      'Russet Autumn', 'Garnet Glow', 'Vermillion Waves', 'Chili Pepper', 'Tomato Vine', 'Raspberry Ripple', 'Cinnamon Spice', 'Paprika Dreams',
      'Blood Orange', 'Maroon Mystery', 'Carmine Canvas', 'Cerise Celebration', 'Claret Elegance', 'Oxblood Vintage',
      'Firecracker Burst', 'Ruby Slipper', 'Candy Apple', 'Red Velvet Cake', 'Barn Door', 'Ferrari Dream', 'Lobster Bisque', 'Red Rock Canyon',
      'Poinsettia Winter', 'Radish Crunch', 'Beet Root', 'Amaranth Bloom', 'Crimson Tide', 'Rouge Royale', 'Scarlet Letter', 'Red Hot Chili',
      'Merlot Night', 'Cabernet Sauvignon', 'Bordeaux Wine', 'Shiraz Sunset', 'Pinot Noir', 'Tempranillo', 'Sangria Summer', 'Port Wine',
      'Red Dahlia', 'Zinnia Fire', 'Red Tulip', 'Red Carnation', 'Red Hibiscus', 'Red Camellia', 'Red Peony', 'Red Ranunculus'
    ],
    orange: [
      'Autumn Harvest', 'Tangerine Sunset', 'Copper Glow', 'Amber Waves', 'Pumpkin Spice', 'Citrus Burst', 'Terracotta Dreams', 'Marigold Fields',
      'Peach Cobbler', 'Apricot Blush', 'Mandarin Magic', 'Persimmon Grove', 'Burnt Sienna', 'Papaya Paradise', 'Cantaloupe Cream', 'Tiger Lily',
      'Saffron Sunset', 'Coral Cascade', 'Flame Flower', 'Honey Amber', 'Rust Revival', 'Ginger Spice', 'Turmeric Gold', 'Mango Tango',
      'Sandstone Serenity', 'Caramel Swirl', 'Bronze Brilliance', 'Ochre Earth', 'Cadmium Burst', 'Tangerine Dream',
      'Clementine Crush', 'Orange Marmalade', 'Sweet Potato', 'Carrot Cake', 'Monarch Butterfly', 'Orange Poppy', 'Calendula Gold', 'Nasturtium',
      'Goldfish Bowl', 'Orange Crush Soda', 'Creamsicle', 'Orange Sherbet', 'Nectarine Nectar', 'Orange Blossom', 'Kumquat', 'Blood Orange Zest',
      'Butterscotch', 'Toffee Crunch', 'Dulce de Leche', 'Burnt Orange', 'Rustic Copper', 'Antique Gold', 'Autumn Leaves', 'Harvest Moon',
      'Tiger Stripe', 'Sunset Beach', 'Desert Sand', 'Canyon Clay', 'Adobe Brick', 'Sahara Dune', 'Terracotta Pot', 'Burnt Umber'
    ],
    yellow: [
      'Golden Hour', 'Sunflower Meadow', 'Honey Drizzle', 'Lemon Zest', 'Canary Song', 'Buttercup Valley', 'Saffron Spice', 'Banana Cream',
      'Daffodil Dance', 'Mustard Seed', 'Corn Silk', 'Champagne Bubbles', 'Citrine Sparkle', 'Vanilla Bean', 'Wheat Field', 'Goldenrod Glory',
      'Amber Honey', 'Sunshine Burst', 'Maize Maze', 'Topaz Treasure', 'Custard Cloud', 'Pineapple Paradise', 'Dandelion Drift', 'Mimosa Morning',
      'Butter Biscuit', 'Lemonade Stand', 'Jonquil Joy', 'Primrose Path', 'Blonde Bombshell', 'Flax Flower',
      'Grapefruit Sunrise', 'Lemon Meringue', 'Lemon Drop', 'Lemon Tart', 'Lemon Chiffon', 'Yellow Submarine', 'Taxi Cab', 'School Bus',
      'Bumblebee Stripe', 'Canola Field', 'Yellow Rose', 'Yellow Iris', 'Yellow Lily', 'Yellow Cosmos', 'Forsythia Branch', 'Yellow Jasmine',
      'Honey Mustard', 'Dijon', 'Golden Retriever', 'Blonde Ale', 'Golden Syrup', 'Liquid Gold', 'Golden Fleece', 'Gold Rush',
      'Yellow Diamond', 'Solar Flare', 'Sunbeam', 'Ray of Light', 'Golden Crown', 'Wheat Beer', 'Corn Husk', 'Straw Hat'
    ],
    green: [
      'Forest Whispers', 'Emerald Isle', 'Mint Breeze', 'Sage Garden', 'Jungle Canopy', 'Lime Splash', 'Olive Grove', 'Moss Carpet',
      'Jade Temple', 'Fern Frond', 'Pine Needle', 'Basil Leaf', 'Eucalyptus Mist', 'Shamrock Luck', 'Avocado Toast', 'Kiwi Kiss',
      'Seaweed Sway', 'Bamboo Forest', 'Chartreuse Charm', 'Malachite Magic', 'Pickle Jar', 'Spinach Smoothie', 'Celery Stick', 'Lettuce Leaf',
      'Pistachio Dream', 'Artichoke Heart', 'Cucumber Cool', 'Pea Pod', 'Ivy League', 'Clover Field', 'Verdant Valley', 'Celadon Serenity',
      'Matcha Latte', 'Green Tea', 'Mint Chocolate Chip', 'Key Lime Pie', 'Lime Sherbet', 'Green Apple', 'Granny Smith', 'Honeydew Melon',
      'Cactus Garden', 'Succulent', 'Aloe Vera', 'Asparagus Spear', 'Green Bean', 'Brussels Sprout', 'Broccoli Crown', 'Kale Chip',
      'Evergreen Forest', 'Douglas Fir', 'Spruce Tree', 'Juniper Berry', 'Cedar Wood', 'Cypress Grove', 'Palm Frond', 'Tropical Rainforest',
      'Emerald City', 'Jade Dragon', 'Malachite Stone', 'Peridot Gem', 'Green Tourmaline', 'Green Onyx', 'Moss Agate', 'Green Marble',
      'Northern Lights', 'Green Aurora', 'Rainforest Canopy', 'Tropical Paradise', 'Amazon River', 'Jungle Vine', 'Monstera Leaf', 'Ficus Tree'
    ],
    blue: [
      'Ocean Depths', 'Sky Canvas', 'Midnight Blues', 'Sapphire Dreams', 'Arctic Frost', 'Denim Waves', 'Cobalt Storm', 'Teal Lagoon',
      'Navy Nights', 'Cerulean Sky', 'Turquoise Tide', 'Periwinkle Peace', 'Powder Blue', 'Steel Storm', 'Indigo Ink', 'Aquamarine Aura',
      'Cornflower Crown', 'Prussian Pride', 'Baby Blue', 'Electric Blue', 'Royal Reign', 'Ice Crystal', 'Peacock Plume', 'Blueberry Burst',
      'Slate Sophistication', 'Azure Adventure', 'Cyan Celebration', 'Ultramarine Universe', 'Cadet Corps', 'Glacier Glow',
      'Sapphire Skies', 'Blue Lagoon', 'Caribbean Sea', 'Mediterranean Coast', 'Deep Blue Sea', 'Pacific Ocean', 'Atlantic Wave', 'Blue Whale',
      'Bluebird', 'Blue Jay', 'Peacock Feather', 'Blue Morpho Butterfly', 'Blue Hydrangea', 'Blue Delphinium', 'Blue Iris', 'Blue Morning Glory',
      'Denim Jacket', 'Blue Jeans', 'Navy Blazer', 'Oxford Blue', 'Cambridge Blue', 'Prussian Blue', 'Egyptian Blue', 'Blue Velvet',
      'Lapis Lazuli', 'Turquoise Stone', 'Aquamarine Gem', 'Blue Topaz', 'Blue Sapphire', 'Blue Zircon', 'Blue Apatite', 'Blue Kyanite',
      'Frozen Lake', 'Icicle', 'Blue Glacier', 'Blue Ice', 'Winter Sky', 'Twilight Hour', 'Dusk', 'Blue Moon'
    ],
    purple: [
      'Lavender Fields', 'Violet Storm', 'Plum Twilight', 'Amethyst Cave', 'Grape Harvest', 'Orchid Garden', 'Indigo Night', 'Lilac Mist',
      'Eggplant Elegance', 'Mauve Magic', 'Periwinkle Paradise', 'Wisteria Wonder', 'Mulberry Moon', 'Thistle Thought', 'Heather Hill', 'Iris Inspiration',
      'Byzantium Beauty', 'Magenta Mystique', 'Fuchsia Fantasy', 'Aubergine Autumn', 'Pansy Patch', 'Clematis Climb', 'Hyacinth Heaven', 'Petunia Party',
      'Royal Purple', 'Deep Violet', 'Plum Perfect', 'Grape Vine', 'Lavender Love', 'Purple Rain',
      'Purple Majesty', 'Imperial Purple', 'Tyrian Purple', 'Purple Heart', 'Purple Mountain', 'Purple Haze', 'Purple Passion', 'Purple Prose',
      'Amethyst Gemstone', 'Purple Sapphire', 'Purple Tourmaline', 'Purple Fluorite', 'Purple Jade', 'Charoite Stone', 'Sugilite Crystal', 'Lepidolite',
      'Lavender Sachet', 'Lavender Essential Oil', 'Lilac Bouquet', 'Lilac Bush', 'Purple Lilac', 'Violet Flower', 'African Violet', 'Sweet Violet',
      'Grape Jelly', 'Concord Grape', 'Red Grape', 'Wine Grape', 'Plum Jam', 'Plum Wine', 'Elderberry', 'Blackberry Jam',
      'Purple Cabbage', 'Purple Potato', 'Purple Carrot', 'Purple Cauliflower', 'Purple Onion', 'Eggplant Parmesan', 'Purple Yam', 'Ube Ice Cream'
    ],
    pink: [
      'Rose Quartz', 'Blush Paradise', 'Flamingo Dance', 'Cotton Candy', 'Peach Blossom', 'Magenta Magic', 'Fuchsia Fantasy', 'Salmon Sunset',
      'Bubblegum Burst', 'Carnation Celebration', 'Hibiscus Heaven', 'Watermelon Wave', 'Strawberry Shake', 'Cherry Cheek', 'Dusty Rose', 'Hot Pink',
      'Ballet Slipper', 'Powder Puff', 'Tickled Pink', 'Rosy Glow', 'Coral Crush', 'Peony Perfection', 'Azalea Bloom', 'Camellia Kiss',
      'Begonia Beauty', 'Tulip Time', 'Geranium Joy', 'Impatiens Impression', 'Cyclamen Cycle', 'Oleander Oasis',
      'Pink Lemonade', 'Pink Champagne', 'Pink Grapefruit', 'Strawberry Ice Cream', 'Strawberry Milkshake', 'Pink Frosting', 'Pink Cupcake', 'Pink Macaron',
      'Pink Diamond', 'Pink Sapphire', 'Pink Topaz', 'Pink Tourmaline', 'Rose Quartz Crystal', 'Rhodochrosite', 'Pink Opal', 'Pink Kunzite',
      'Cherry Blossom Festival', 'Sakura Spring', 'Pink Magnolia', 'Pink Dogwood', 'Pink Rose', 'Pink Dahlia', 'Pink Zinnia', 'Pink Cosmos',
      'Flamingo Pink', 'Millennial Pink', 'Bubblegum Pink', 'Barbie Pink', 'Hot Pink', 'Neon Pink', 'Shocking Pink', 'Fuchsia Pink',
      'Baby Pink', 'Pastel Pink', 'Blush Pink', 'Rose Pink', 'Dusty Pink', 'Mauve Pink', 'Salmon Pink', 'Coral Pink'
    ]
  },

  // Nuevas categorías temáticas - MÁXIMA EXPANSIÓN
  themes: {
    nature: [
      'Botanical', 'Floral', 'Garden', 'Wilderness', 'Forest', 'Jungle', 'Desert', 'Mountain',
      'Ocean', 'River', 'Lake', 'Meadow', 'Prairie', 'Savanna', 'Tundra', 'Rainforest',
      'Coral Reef', 'Tropical', 'Arctic', 'Alpine', 'Coastal', 'Woodland', 'Grove', 'Valley',
      'Canyon', 'Plateau', 'Gorge', 'Cliff', 'Cave', 'Cavern', 'Grotto', 'Island',
      'Peninsula', 'Archipelago', 'Atoll', 'Lagoon', 'Bay', 'Cove', 'Fjord', 'Delta',
      'Marsh', 'Swamp', 'Wetland', 'Bog', 'Fen', 'Moor', 'Heath', 'Steppe'
    ],
    seasons: [
      'Spring Awakening', 'Summer Solstice', 'Autumn Harvest', 'Winter Wonderland',
      'Vernal Equinox', 'Midsummer Night', 'Fall Foliage', 'Frozen Landscape',
      'Cherry Blossom', 'Beach Vacation', 'Pumpkin Patch', 'Snow Globe',
      'Easter Morning', 'Tropical Paradise', 'Thanksgiving', 'Christmas Magic',
      'Spring Bloom', 'Summer Breeze', 'Autumn Leaves', 'Winter Frost',
      'First Snow', 'Last Frost', 'Indian Summer', 'Monsoon Season',
      'Harvest Time', 'Planting Season', 'Golden Autumn', 'Deep Winter'
    ],
    emotions: [
      'Joyful', 'Melancholic', 'Energetic', 'Peaceful', 'Passionate', 'Mysterious',
      'Optimistic', 'Nostalgic', 'Dramatic', 'Romantic', 'Playful', 'Sophisticated',
      'Rebellious', 'Elegant', 'Bold', 'Gentle', 'Fierce', 'Serene',
      'Whimsical', 'Intense', 'Dreamy', 'Powerful', 'Delicate', 'Dynamic',
      'Cheerful', 'Sombre', 'Vibrant', 'Mellow', 'Exuberant', 'Contemplative',
      'Euphoric', 'Wistful', 'Confident', 'Tender', 'Spirited', 'Calm',
      'Ecstatic', 'Pensive', 'Lively', 'Tranquil', 'Zealous', 'Reflective'
    ],
    art_movements: [
      'Impressionist', 'Cubist', 'Surreal', 'Abstract', 'Minimalist', 'Pop Art',
      'Art Deco', 'Bauhaus', 'Renaissance', 'Baroque', 'Rococo', 'Neoclassical',
      'Romantic', 'Expressionist', 'Fauvism', 'Dadaist', 'Futurist', 'Constructivist',
      'Pointillist', 'Post-Modern', 'Contemporary', 'Avant-garde', 'Neo-Gothic', 'Art Nouveau',
      'Suprematist', 'De Stijl', 'Orphism', 'Vorticism', 'Precisionism', 'Regionalism',
      'Social Realism', 'Magic Realism', 'Photorealism', 'Hyperrealism', 'Neo-Expressionism', 'Transavantgarde'
    ],
    textures: [
      'Velvet', 'Silk', 'Satin', 'Linen', 'Cotton', 'Wool', 'Cashmere', 'Leather',
      'Marble', 'Granite', 'Wood', 'Metal', 'Glass', 'Crystal', 'Pearl', 'Diamond',
      'Rough', 'Smooth', 'Textured', 'Polished', 'Matte', 'Glossy', 'Brushed', 'Hammered',
      'Suede', 'Denim', 'Canvas', 'Burlap', 'Tweed', 'Corduroy', 'Chenille', 'Brocade',
      'Sandstone', 'Limestone', 'Slate', 'Quartz', 'Obsidian', 'Onyx', 'Jade', 'Amber',
      'Bronze', 'Copper', 'Brass', 'Steel', 'Iron', 'Gold', 'Silver', 'Platinum'
    ],
    time_periods: [
      'Ancient', 'Medieval', 'Renaissance', 'Victorian', 'Art Deco', 'Mid-Century',
      'Retro', 'Vintage', 'Modern', 'Contemporary', 'Futuristic', 'Timeless',
      'Classic', 'Traditional', 'Progressive', 'Revolutionary', 'Nostalgic', 'Historic',
      'Prehistoric', 'Primordial', 'Eternal', 'Ephemeral', 'Momentary', 'Lasting',
      'Edwardian', 'Georgian', 'Regency', 'Elizabethan', 'Tudor', 'Jacobean',
      'Belle Époque', 'Roaring Twenties', 'Jazz Age', 'Atomic Age', 'Space Age', 'Digital Age'
    ],
    cultural: [
      'Mediterranean', 'Scandinavian', 'Asian', 'African', 'Latin', 'Nordic',
      'Bohemian', 'Industrial', 'Urban', 'Rural', 'Cosmopolitan', 'Provincial',
      'Exotic', 'Familiar', 'Foreign', 'Domestic', 'International', 'Local',
      'Global', 'Regional', 'Tribal', 'Modern', 'Traditional', 'Fusion',
      'Japanese', 'Chinese', 'Korean', 'Indian', 'Thai', 'Vietnamese',
      'French', 'Italian', 'Spanish', 'Greek', 'Portuguese', 'Brazilian',
      'Mexican', 'Peruvian', 'Argentinian', 'Moroccan', 'Egyptian', 'Turkish',
      'Russian', 'German', 'British', 'Irish', 'Scottish', 'Dutch'
    ],
    astronomy: [
      'Celestial', 'Stellar', 'Cosmic', 'Galactic', 'Nebula', 'Supernova',
      'Constellation', 'Aurora', 'Eclipse', 'Comet', 'Meteor', 'Asteroid',
      'Planetary', 'Lunar', 'Solar', 'Interstellar', 'Cosmic Dust', 'Stardust',
      'Milky Way', 'Andromeda', 'Orion', 'Cassiopeia', 'Big Dipper', 'North Star',
      'Red Giant', 'White Dwarf', 'Black Hole', 'Quasar', 'Pulsar', 'Magnetar'
    ],
    architecture: [
      'Gothic Cathedral', 'Art Deco Skyscraper', 'Brutalist', 'Modernist', 'Postmodern',
      'Colonial', 'Victorian Mansion', 'Craftsman Bungalow', 'Prairie Style', 'International Style',
      'Deconstructivist', 'Organic Architecture', 'High-Tech', 'Parametric', 'Biomorphic',
      'Bauhaus', 'Neo-Classical', 'Romanesque', 'Byzantine', 'Moorish',
      'Pagoda', 'Temple', 'Mosque', 'Synagogue', 'Cathedral', 'Basilica'
    ],
    gastronomy: [
      'Espresso', 'Cappuccino', 'Latte', 'Mocha', 'Macchiato', 'Affogato',
      'Tiramisu', 'Panna Cotta', 'Crème Brûlée', 'Macaron', 'Éclair', 'Madeleine',
      'Croissant', 'Baguette', 'Brioche', 'Pain au Chocolat', 'Sourdough', 'Focaccia',
      'Risotto', 'Ratatouille', 'Bouillabaisse', 'Paella', 'Tapas', 'Sangria',
      'Sushi', 'Ramen', 'Tempura', 'Miso', 'Matcha', 'Sake'
    ],
    music: [
      'Jazz', 'Blues', 'Funk', 'Soul', 'R&B', 'Gospel',
      'Rock', 'Punk', 'Metal', 'Grunge', 'Indie', 'Alternative',
      'Classical', 'Baroque', 'Romantic', 'Symphony', 'Concerto', 'Sonata',
      'Electronic', 'Techno', 'House', 'Trance', 'Ambient', 'Dubstep',
      'Hip-Hop', 'Rap', 'Trap', 'Lo-Fi', 'Chillwave', 'Vaporwave'
    ],
    gemstones: [
      'Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Topaz', 'Amethyst',
      'Aquamarine', 'Garnet', 'Opal', 'Turquoise', 'Jade', 'Onyx',
      'Pearl', 'Coral', 'Amber', 'Moonstone', 'Sunstone', 'Labradorite',
      'Tanzanite', 'Alexandrite', 'Morganite', 'Kunzite', 'Peridot', 'Citrine'
    ],
    weather: [
      'Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Foggy', 'Misty',
      'Snowy', 'Frosty', 'Icy', 'Windy', 'Breezy', 'Calm',
      'Thunder', 'Lightning', 'Rainbow', 'Drizzle', 'Shower', 'Monsoon',
      'Hailstorm', 'Blizzard', 'Tornado', 'Hurricane', 'Cyclone', 'Typhoon'
    ]
  },
  
  // Nombres basados en saturación - MÁXIMA EXPANSIÓN
  saturation: {
    high: [
      'Vibrant', 'Electric', 'Neon', 'Intense', 'Bold', 'Vivid', 'Brilliant', 'Radiant',
      'Explosive', 'Dynamic', 'Energetic', 'Powerful', 'Striking', 'Dramatic', 'Fierce', 'Blazing',
      'Dazzling', 'Luminous', 'Spectacular', 'Magnificent', 'Electrifying', 'Pulsating', 'Sizzling', 'Scorching',
      'Thunderous', 'Volcanic', 'Cosmic', 'Supersonic', 'Hypnotic', 'Mesmerizing',
      'Fluorescent', 'Incandescent', 'Phosphorescent', 'Iridescent', 'Opalescent', 'Prismatic',
      'Kaleidoscopic', 'Psychedelic', 'Chromatic', 'Technicolor', 'High-Key', 'Saturated',
      'Full-Spectrum', 'Maximum', 'Ultra', 'Super', 'Mega', 'Hyper', 'Extreme', 'Intense'
    ],
    medium: [
      'Balanced', 'Harmonious', 'Refined', 'Elegant', 'Sophisticated', 'Classic', 'Timeless', 'Graceful',
      'Polished', 'Cultured', 'Composed', 'Measured', 'Thoughtful', 'Considered', 'Curated', 'Artisanal',
      'Crafted', 'Tailored', 'Bespoke', 'Premium', 'Distinguished', 'Noble', 'Dignified', 'Majestic',
      'Regal', 'Aristocratic', 'Luxurious', 'Opulent', 'Sumptuous', 'Lavish',
      'Moderate', 'Equilibrium', 'Stable', 'Steady', 'Even', 'Proportional', 'Symmetrical', 'Orderly',
      'Professional', 'Corporate', 'Business', 'Executive', 'Formal', 'Conservative', 'Traditional', 'Conventional'
    ],
    low: [
      'Muted', 'Subtle', 'Soft', 'Gentle', 'Pastel', 'Whispered', 'Delicate', 'Understated',
      'Tender', 'Peaceful', 'Serene', 'Tranquil', 'Calm', 'Soothing', 'Relaxing', 'Meditative',
      'Zen', 'Minimalist', 'Pure', 'Clean', 'Fresh', 'Airy', 'Light', 'Ethereal',
      'Dreamy', 'Misty', 'Cloudy', 'Hazy', 'Foggy', 'Gossamer',
      'Washed', 'Faded', 'Bleached', 'Weathered', 'Vintage', 'Antique', 'Aged', 'Worn',
      'Subdued', 'Toned-Down', 'Desaturated', 'Greyed', 'Neutral', 'Natural', 'Organic', 'Earthy'
    ]
  },
  
  // Nombres basados en luminosidad - MÁXIMA EXPANSIÓN
  lightness: {
    dark: [
      'Shadow', 'Midnight', 'Deep', 'Rich', 'Moody', 'Mysterious', 'Dramatic', 'Intense',
      'Shadowy', 'Enigmatic', 'Cryptic', 'Secretive', 'Hidden', 'Veiled', 'Obscure', 'Twilight',
      'Nocturnal', 'Lunar', 'Eclipse', 'Abyssal', 'Cavernous', 'Subterranean', 'Underground', 'Gothic',
      'Victorian', 'Vintage', 'Antique', 'Ancient', 'Timeless', 'Eternal',
      'Noir', 'Obsidian', 'Onyx', 'Ebony', 'Charcoal', 'Graphite', 'Slate', 'Smoke',
      'Dusky', 'Murky', 'Dim', 'Somber', 'Grave', 'Solemn', 'Austere', 'Stark',
      'Raven', 'Crow', 'Coal', 'Ink', 'Tar', 'Pitch', 'Sable', 'Jet'
    ],
    medium: [
      'Balanced', 'Natural', 'Earthy', 'Warm', 'Cozy', 'Comfortable', 'Inviting', 'Serene',
      'Homey', 'Familiar', 'Intimate', 'Personal', 'Heartwarming', 'Embracing', 'Nurturing', 'Caring',
      'Loving', 'Affectionate', 'Tender', 'Sweet', 'Charming', 'Endearing', 'Delightful', 'Cheerful',
      'Uplifting', 'Inspiring', 'Encouraging', 'Motivating', 'Empowering', 'Energizing',
      'Neutral', 'Grounded', 'Stable', 'Steady', 'Reliable', 'Dependable', 'Consistent', 'Constant',
      'Mid-Tone', 'Moderate', 'Even', 'Level', 'Temperate', 'Mild', 'Gentle', 'Soft'
    ],
    light: [
      'Bright', 'Airy', 'Fresh', 'Clean', 'Luminous', 'Radiant', 'Glowing', 'Celestial',
      'Incandescent', 'Effulgent', 'Resplendent', 'Scintillating', 'Coruscating', 'Blazing', 'Flashing', 'Twinkling',
      'Shimmering', 'Glittering', 'Iridescent', 'Opalescent', 'Pearlescent', 'Crystalline', 'Diamond', 'Solar',
      'Stellar', 'Angelic', 'Heavenly', 'Divine', 'Ethereal', 'Transcendent',
      'Ivory', 'Cream', 'Vanilla', 'Champagne', 'Beige', 'Linen', 'Alabaster', 'Porcelain',
      'Pale', 'Fair', 'Blonde', 'Platinum', 'Silver', 'White', 'Snow', 'Cloud',
      'Daylight', 'Dawn', 'Morning', 'Sunrise', 'Sunlit', 'Illuminated', 'Brightened', 'Whitened'
    ]
  },
  
  // Nombres basados en tipo de paleta - Ampliado significativamente
  type: {
    monochromatic: [
      'Monochrome', 'Single Hue', 'Tonal', 'Gradient', 'Spectrum', 'Fade', 'Ombre', 'Cascade',
      'Unified', 'Cohesive', 'Singular', 'Pure', 'Focused', 'Concentrated', 'Distilled', 'Essential',
      'Minimalist', 'Streamlined', 'Simplified', 'Refined', 'Elegant', 'Sophisticated', 'Classic', 'Timeless',
      'Monotone', 'Grayscale', 'Sepia', 'Vintage', 'Retro', 'Nostalgic'
    ],
    complementary: [
      'Contrast', 'Opposition', 'Balance', 'Harmony', 'Duality', 'Tension', 'Dynamic Duo', 'Perfect Pair',
      'Dramatic', 'Powerful', 'Intense', 'Electric', 'Magnetic', 'Explosive', 'Fierce', 'Strong',
      'Polarized', 'Dualistic', 'Binary', 'Opposing', 'Conflicting', 'Equilibrium', 'Bold', 'Striking',
      'Yin Yang', 'Day Night', 'Fire Ice', 'Hot Cold', 'Light Dark', 'Thunder Lightning'
    ],
    analogous: [
      'Neighbors', 'Flow', 'Transition', 'Blend', 'Smooth', 'Adjacent', 'Continuous', 'Seamless',
      'Harmonious', 'Melodic', 'Rhythmic', 'Fluid', 'Organic', 'Natural', 'Gentle', 'Soft',
      'Transitional', 'Progressive', 'Evolutionary', 'Gradual', 'Subtle', 'Nuanced', 'Delicate', 'Tender',
      'Peaceful', 'Serene', 'Calming', 'Soothing', 'Relaxing', 'Meditative'
    ],
    triadic: [
      'Triangle', 'Trinity', 'Triple', 'Triad', 'Three-Way', 'Triangular', 'Tri-Color', 'Triple Harmony',
      'Trio', 'Triumvirate', 'Tripod', 'Geometric', 'Structured', 'Balanced', 'Stable', 'Rhythmic',
      'Mathematical', 'Precise', 'Calculated', 'Measured', 'Proportional', 'Symmetrical', 'Ordered', 'Systematic',
      'Primary', 'Secondary', 'Tertiary', 'Foundation', 'Core', 'Essential'
    ],
    tetradic: [
      'Square', 'Quad', 'Four-Way', 'Rectangle', 'Quadrant', 'Four Corners', 'Tetrad', 'Quartet',
      'Quadruple', 'Fourfold', 'Quaternary', 'Cardinal', 'Compass', 'Directional', 'Cross', 'Complex',
      'Sophisticated', 'Advanced', 'Intricate', 'Elaborate', 'Comprehensive', 'Complete', 'Full', 'Whole',
      'Seasonal', 'Elemental', 'Universal', 'Cosmic', 'Infinite', 'Eternal'
    ]
  },
  
  // Sufijos creativos - MÁXIMA EXPANSIÓN
  suffixes: [
    'Collection', 'Palette', 'Series', 'Ensemble', 'Symphony', 'Harmony', 'Spectrum', 'Range', 'Blend', 'Mix', 'Fusion', 'Composition',
    'Theme', 'Scheme', 'Combo', 'Set', 'Array', 'Suite', 'Package', 'Bundle',
    'Vision', 'Dream', 'Story', 'Journey', 'Adventure', 'Experience', 'Moment', 'Memory',
    'Mood', 'Vibe', 'Feeling', 'Atmosphere', 'Ambiance', 'Essence', 'Spirit', 'Soul',
    'Edition', 'Version', 'Release', 'Drop', 'Launch', 'Debut', 'Premiere', 'Showcase',
    'Gallery', 'Exhibition', 'Display', 'Presentation', 'Portfolio', 'Anthology', 'Archive', 'Library'
  ]
};

// Función para obtener el hue dominante
function getDominantHue(color: ColorValue): string {
  const hue = color.hsl.h;
  
  if (hue >= 0 && hue < 30) return 'red';
  if (hue >= 30 && hue < 60) return 'orange';
  if (hue >= 60 && hue < 90) return 'yellow';
  if (hue >= 90 && hue < 150) return 'green';
  if (hue >= 150 && hue < 210) return 'blue';
  if (hue >= 210 && hue < 270) return 'blue';
  if (hue >= 270 && hue < 330) return 'purple';
  return 'pink';
}

// Función para categorizar saturación
function getSaturationLevel(saturation: number): 'high' | 'medium' | 'low' {
  if (saturation > 70) return 'high';
  if (saturation > 30) return 'medium';
  return 'low';
}

// Función para categorizar luminosidad
function getLightnessLevel(lightness: number): 'dark' | 'medium' | 'light' {
  if (lightness < 30) return 'dark';
  if (lightness < 70) return 'medium';
  return 'light';
}

// Función para detectar tipo de paleta
function detectPaletteType(shades: ColorShade[]): string {
  if (shades.length < 2) return 'single';
  
  const hues = shades.map(shade => shade.color.hsl.h);
  const uniqueHues = [...new Set(hues.map(h => Math.round(h / 30) * 30))];
  
  if (uniqueHues.length === 1) return 'monochromatic';
  if (uniqueHues.length === 2) {
    const diff = Math.abs(uniqueHues[0] - uniqueHues[1]);
    if (diff > 150 && diff < 210) return 'complementary';
  }
  if (uniqueHues.length === 3) return 'triadic';
  if (uniqueHues.length === 4) return 'tetradic';
  
  // Verificar si son colores análogos (cercanos en el círculo cromático)
  const sortedHues = uniqueHues.sort((a, b) => a - b);
  let isAnalogous = true;
  for (let i = 1; i < sortedHues.length; i++) {
    const diff = sortedHues[i] - sortedHues[i - 1];
    if (diff > 60) {
      isAnalogous = false;
      break;
    }
  }
  
  return isAnalogous ? 'analogous' : 'custom';
}

// Función para obtener un elemento aleatorio de un array
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Función principal para generar nombres de paleta - Mejorada significativamente
export function generatePaletteName(shades: ColorShade[]): string {
  if (!shades || shades.length === 0) return 'Empty Palette';
  
  // Analizar el color dominante (primer color o el más saturado)
  const dominantShade = shades.reduce((prev, current) => 
    current.color.hsl.s > prev.color.hsl.s ? current : prev
  );
  
  const dominantHue = getDominantHue(dominantShade.color);
  const saturationLevel = getSaturationLevel(dominantShade.color.hsl.s);
  const lightnessLevel = getLightnessLevel(dominantShade.color.hsl.l);
  const paletteType = detectPaletteType(shades);
  
  // Calcular saturación y luminosidad promedio
  const avgSaturation = shades.reduce((sum, shade) => sum + shade.color.hsl.s, 0) / shades.length;
  const avgLightness = shades.reduce((sum, shade) => sum + shade.color.hsl.l, 0) / shades.length;
  
  // Obtener elementos aleatorios de las nuevas categorías temáticas
  const getThemeElement = (category: keyof typeof PALETTE_NAMES.themes) => {
    return getRandomElement(PALETTE_NAMES.themes[category] || []);
  };
  
  // Función auxiliar para nombres de respaldo
  const generateFallbackName = (): string => {
    const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
    const satNames = PALETTE_NAMES.saturation[saturationLevel];
    const hueName = getRandomElement(hueNames);
    const satName = getRandomElement(satNames);
    return `${satName} ${hueName}`;
  };
  
  // Generar nombre basado en diferentes estrategias - MÁXIMA EXPANSIÓN
  const strategies = [
    // Estrategias originales mejoradas
    () => {
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      const satNames = PALETTE_NAMES.saturation[saturationLevel];
      return `${getRandomElement(satNames)} ${getRandomElement(hueNames)}`;
    },

    () => {
      const lightNames = PALETTE_NAMES.lightness[lightnessLevel];
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      return `${getRandomElement(lightNames)} ${getRandomElement(hueNames)}`;
    },

    () => {
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      const suffix = getRandomElement(PALETTE_NAMES.suffixes);
      return `${getRandomElement(hueNames)} ${suffix}`;
    },

    // Estrategias temáticas - NATURE
    () => {
      const nature = getThemeElement('nature');
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      const hueName = getRandomElement(hueNames);
      return `${nature} ${hueName}`;
    },

    () => {
      const nature = getThemeElement('nature');
      const suffix = getRandomElement(PALETTE_NAMES.suffixes);
      return `${nature} ${suffix}`;
    },

    // Estrategias temáticas - EMOTIONS
    () => {
      const emotion = getThemeElement('emotions');
      const satNames = PALETTE_NAMES.saturation[saturationLevel];
      const satName = getRandomElement(satNames);
      return `${emotion} ${satName}`;
    },

    () => {
      const emotion = getThemeElement('emotions');
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      return `${emotion} ${getRandomElement(hueNames)}`;
    },

    // Estrategias temáticas - ART MOVEMENTS
    () => {
      const artMovement = getThemeElement('art_movements');
      const typeNames = PALETTE_NAMES.type[paletteType as keyof typeof PALETTE_NAMES.type] || ['Custom'];
      const typeName = getRandomElement(typeNames);
      return `${artMovement} ${typeName}`;
    },

    () => {
      const artMovement = getThemeElement('art_movements');
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      return `${artMovement} ${getRandomElement(hueNames)}`;
    },

    // Estrategias temáticas - TEXTURES
    () => {
      const texture = getThemeElement('textures');
      const lightNames = PALETTE_NAMES.lightness[lightnessLevel];
      const lightName = getRandomElement(lightNames);
      return `${texture} ${lightName}`;
    },

    () => {
      const texture = getThemeElement('textures');
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      return `${texture} ${getRandomElement(hueNames)}`;
    },

    // Estrategias temáticas - TIME PERIODS
    () => {
      const timePeriod = getThemeElement('time_periods');
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      const hueName = getRandomElement(hueNames);
      return `${timePeriod} ${hueName}`;
    },

    () => {
      const timePeriod = getThemeElement('time_periods');
      const suffix = getRandomElement(PALETTE_NAMES.suffixes);
      return `${timePeriod} ${suffix}`;
    },

    // Estrategias temáticas - CULTURAL
    () => {
      const cultural = getThemeElement('cultural');
      const satNames = PALETTE_NAMES.saturation[saturationLevel];
      const satName = getRandomElement(satNames);
      return `${cultural} ${satName}`;
    },

    () => {
      const cultural = getThemeElement('cultural');
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      return `${cultural} ${getRandomElement(hueNames)}`;
    },

    // NUEVAS Estrategias temáticas - ASTRONOMY
    () => {
      const astronomy = getThemeElement('astronomy');
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      return `${astronomy} ${getRandomElement(hueNames)}`;
    },

    () => {
      const astronomy = getThemeElement('astronomy');
      const lightNames = PALETTE_NAMES.lightness[lightnessLevel];
      return `${astronomy} ${getRandomElement(lightNames)}`;
    },

    // NUEVAS Estrategias temáticas - ARCHITECTURE
    () => {
      const architecture = getThemeElement('architecture');
      const satNames = PALETTE_NAMES.saturation[saturationLevel];
      return `${architecture} ${getRandomElement(satNames)}`;
    },

    () => {
      const architecture = getThemeElement('architecture');
      return architecture;
    },

    // NUEVAS Estrategias temáticas - GASTRONOMY
    () => {
      const gastronomy = getThemeElement('gastronomy');
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      return `${gastronomy} ${getRandomElement(hueNames)}`;
    },

    () => {
      const gastronomy = getThemeElement('gastronomy');
      return gastronomy;
    },

    // NUEVAS Estrategias temáticas - MUSIC
    () => {
      const music = getThemeElement('music');
      const emotion = getThemeElement('emotions');
      return `${music} ${emotion}`;
    },

    () => {
      const music = getThemeElement('music');
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      return `${music} ${getRandomElement(hueNames)}`;
    },

    // NUEVAS Estrategias temáticas - GEMSTONES
    () => {
      const gemstone = getThemeElement('gemstones');
      const lightNames = PALETTE_NAMES.lightness[lightnessLevel];
      return `${gemstone} ${getRandomElement(lightNames)}`;
    },

    () => {
      const gemstone = getThemeElement('gemstones');
      const suffix = getRandomElement(PALETTE_NAMES.suffixes);
      return `${gemstone} ${suffix}`;
    },

    // NUEVAS Estrategias temáticas - WEATHER
    () => {
      const weather = getThemeElement('weather');
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      return `${weather} ${getRandomElement(hueNames)}`;
    },

    () => {
      const weather = getThemeElement('weather');
      const nature = getThemeElement('nature');
      return `${weather} ${nature}`;
    },

    // Estrategias estacionales específicas
    () => {
      const season = getThemeElement('seasons');
      return season;
    },

    () => {
      const season = getThemeElement('seasons');
      const suffix = getRandomElement(PALETTE_NAMES.suffixes);
      return `${season} ${suffix}`;
    },

    // Combinaciones complejas de 2 elementos
    () => {
      const emotion = getThemeElement('emotions');
      const nature = getThemeElement('nature');
      return `${emotion} ${nature}`;
    },

    () => {
      const astronomy = getThemeElement('astronomy');
      const emotion = getThemeElement('emotions');
      return `${astronomy} ${emotion}`;
    },

    () => {
      const cultural = getThemeElement('cultural');
      const gastronomy = getThemeElement('gastronomy');
      return `${cultural} ${gastronomy}`;
    },

    () => {
      const music = getThemeElement('music');
      const architecture = getThemeElement('architecture');
      return `${music} ${architecture}`;
    },

    () => {
      const weather = getThemeElement('weather');
      const season = getThemeElement('seasons');
      return `${weather} ${season}`;
    },

    // Combinaciones complejas de 3 elementos
    () => {
      const emotion = getThemeElement('emotions');
      const texture = getThemeElement('textures');
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      const hueName = getRandomElement(hueNames);
      return `${emotion} ${texture} ${hueName}`;
    },

    () => {
      const nature = getThemeElement('nature');
      const artMovement = getThemeElement('art_movements');
      return `${nature} ${artMovement}`;
    },

    () => {
      const cultural = getThemeElement('cultural');
      const timePeriod = getThemeElement('time_periods');
      const typeNames = PALETTE_NAMES.type[paletteType as keyof typeof PALETTE_NAMES.type] || ['Custom'];
      const typeName = getRandomElement(typeNames);
      return `${cultural} ${timePeriod} ${typeName}`;
    },

    () => {
      const astronomy = getThemeElement('astronomy');
      const gemstone = getThemeElement('gemstones');
      const suffix = getRandomElement(PALETTE_NAMES.suffixes);
      return `${astronomy} ${gemstone} ${suffix}`;
    },

    () => {
      const weather = getThemeElement('weather');
      const nature = getThemeElement('nature');
      const emotion = getThemeElement('emotions');
      return `${weather} ${nature} ${emotion}`;
    },

    // Estrategia 4: Combinación compleja basada en características
    () => {
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      const satNames = PALETTE_NAMES.saturation[saturationLevel];
      const lightNames = PALETTE_NAMES.lightness[lightnessLevel];

      if (avgSaturation > 60 && avgLightness < 40) {
        return `${getRandomElement(lightNames)} ${getRandomElement(hueNames)}`;
      } else if (avgSaturation < 30) {
        return `${getRandomElement(satNames)} ${getRandomElement(hueNames)}`;
      } else {
        return `${getRandomElement(hueNames)}`;
      }
    },

    // Estrategias específicas por tipo de paleta
    () => {
      if (paletteType === 'monochromatic') {
        const texture = getThemeElement('textures');
        const lightNames = PALETTE_NAMES.lightness[lightnessLevel];
        const lightName = getRandomElement(lightNames);
        return `${texture} ${lightName} Monochrome`;
      }
      return generateFallbackName();
    },

    () => {
      if (paletteType === 'complementary') {
        const emotion = getThemeElement('emotions');
        return `${emotion} Contrast`;
      }
      return generateFallbackName();
    },

    // Estrategia 5: Nombres únicos basados en combinaciones específicas
    () => {
      if (paletteType === 'monochromatic' && avgLightness > 70) {
        return `Soft ${getRandomElement(PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'])} Gradient`;
      }
      if (paletteType === 'complementary') {
        return `${getRandomElement(['Dynamic', 'Bold', 'Striking'])} Contrast`;
      }
      if (avgSaturation > 80) {
        return `${getRandomElement(['Electric', 'Neon', 'Vibrant'])} ${getRandomElement(PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'])}`;
      }
      if (avgLightness < 25) {
        return `${getRandomElement(['Midnight', 'Shadow', 'Deep'])} ${getRandomElement(PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'])}`;
      }

      return `${getRandomElement(PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'])} ${getRandomElement(PALETTE_NAMES.suffixes)}`;
    },

    // Estrategia simple con solo hue
    () => {
      const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
      return getRandomElement(hueNames);
    },

    // Estrategias con sufijos creativos
    () => {
      const satNames = PALETTE_NAMES.saturation[saturationLevel];
      const suffix = getRandomElement(PALETTE_NAMES.suffixes);
      return `${getRandomElement(satNames)} ${suffix}`;
    },

    () => {
      const lightNames = PALETTE_NAMES.lightness[lightnessLevel];
      const suffix = getRandomElement(PALETTE_NAMES.suffixes);
      return `${getRandomElement(lightNames)} ${suffix}`;
    }
  ];
  
  // Seleccionar estrategia basada en características de la paleta
  let selectedStrategy;
  if (shades.length === 1) {
    selectedStrategy = strategies[0]; // Simple para un solo color
  } else if (paletteType === 'monochromatic') {
    selectedStrategy = strategies[Math.random() > 0.5 ? 0 : 3]; // Enfoque en saturación/luminosidad
  } else if (paletteType === 'complementary') {
    selectedStrategy = strategies[4]; // Estrategia especial para complementarios
  } else {
    selectedStrategy = getRandomElement(strategies); // Aleatorio para otros casos
  }
  
  const result = selectedStrategy();
  
  // Verificar que el resultado no esté vacío
  return result && result.trim() !== '' ? result : generateFallbackName();
}

// Función para generar múltiples opciones de nombres
export function generateMultiplePaletteNames(shades: ColorShade[], count: number = 3): string[] {
  const names = new Set<string>();
  let attempts = 0;
  const maxAttempts = count * 3;
  
  while (names.size < count && attempts < maxAttempts) {
    names.add(generatePaletteName(shades));
    attempts++;
  }
  
  return Array.from(names);
}

// Función para obtener un nombre consistente basado en hash de colores
export function getConsistentPaletteName(shades: ColorShade[]): string {
  if (!shades || shades.length === 0) return 'Empty Palette';
  
  // Crear un hash simple basado en los colores
  const colorString = shades.map(shade => shade.color.hex).join('');
  let hash = 0;
  for (let i = 0; i < colorString.length; i++) {
    const char = colorString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Usar el hash para seleccionar elementos de manera consistente
  const absHash = Math.abs(hash);
  const dominantShade = shades[0];
  const dominantHue = getDominantHue(dominantShade.color);
  const saturationLevel = getSaturationLevel(dominantShade.color.hsl.s);
  const lightnessLevel = getLightnessLevel(dominantShade.color.hsl.l);
  
  const hueNames = PALETTE_NAMES.hue[dominantHue as keyof typeof PALETTE_NAMES.hue] || ['Color'];
  const satNames = PALETTE_NAMES.saturation[saturationLevel];
  const lightNames = PALETTE_NAMES.lightness[lightnessLevel];
  const suffixes = PALETTE_NAMES.suffixes;
  
  const selectedHue = hueNames[absHash % hueNames.length];
  const selectedSat = satNames[absHash % satNames.length];
  const selectedLight = lightNames[absHash % lightNames.length];
  const selectedSuffix = suffixes[absHash % suffixes.length];
  
  // Seleccionar formato basado en hash
  const formatIndex = absHash % 4;
  switch (formatIndex) {
    case 0:
      return `${selectedSat} ${selectedHue}`;
    case 1:
      return `${selectedLight} ${selectedHue}`;
    case 2:
      return `${selectedHue} ${selectedSuffix}`;
    default:
      return selectedHue;
  }
}