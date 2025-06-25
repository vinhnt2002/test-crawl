const create_db_tiktokshop = require("./lib/db_tiktokshop");

async function setupDatabase() {
  console.log("🚀 Setting up FastMoss Crawler database...");
  
  try {
    const db = await create_db_tiktokshop();
    console.log("✅ Connected to MongoDB");

    // Insert sample sellers
    console.log("📦 Inserting sample sellers...");
    const sampleSellers = [
      {
        seller_id: "123456789",
        seller_name: "Sample Seller 1",
        fastmoss: null,
        fastmoss_count: 0,
        created_at: Math.floor(Date.now() / 1000)
      },
      {
        seller_id: "987654321", 
        seller_name: "Sample Seller 2",
        fastmoss: null,
        fastmoss_count: 0,
        created_at: Math.floor(Date.now() / 1000)
      }
    ];

    for (const seller of sampleSellers) {
      try {
        await db.seller_ids.insertOne(seller);
        console.log(`   ✅ Added seller: ${seller.seller_name}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`   ⚠️  Seller ${seller.seller_name} already exists`);
        } else {
          console.error(`   ❌ Error adding seller ${seller.seller_name}:`, error.message);
        }
      }
    }

    // Insert sample keywords
    console.log("🔍 Inserting sample keywords...");
    const sampleKeywords = [
      {
        keyword: "t shirt",
        fastmoss: null,
        fastmoss_count: 0,
        created_at: Math.floor(Date.now() / 1000)
      },
      {
        keyword: "hoodie",
        fastmoss: null,
        fastmoss_count: 0,
        created_at: Math.floor(Date.now() / 1000)
      },
      {
        keyword: "sweatshirt",
        fastmoss: null,
        fastmoss_count: 0,
        created_at: Math.floor(Date.now() / 1000)
      },
      {
        keyword: "polo shirt",
        fastmoss: null,
        fastmoss_count: 0,
        created_at: Math.floor(Date.now() / 1000)
      }
    ];

    for (const keyword of sampleKeywords) {
      try {
        await db.keywords.insertOne(keyword);
        console.log(`   ✅ Added keyword: ${keyword.keyword}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`   ⚠️  Keyword "${keyword.keyword}" already exists`);
        } else {
          console.error(`   ❌ Error adding keyword "${keyword.keyword}":`, error.message);
        }
      }
    }

    // Insert trademark settings
    console.log("⚫ Inserting trademark blacklist settings...");
    const trademarkSettings = {
      type: "trademark_blacklist",
      patterns: [
        "nike",
        "adidas", 
        "supreme",
        "gucci",
        "louis vuitton",
        "chanel",
        "prada",
        "versace",
        "balenciaga",
        "off-white",
        "yeezy",
        "jordan",
        "converse",
        "vans",
        "champion",
        "tommy hilfiger",
        "calvin klein",
        "polo ralph lauren",
        "lacoste",
        "fendi",
        "burberry",
        "armani",
        "dolce gabbana",
        "valentino",
        "givenchy",
        "moschino",
        "kenzo",
        "bape",
        "stone island",
        "moncler"
      ],
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000)
    };

    try {
      await db.settings.insertOne(trademarkSettings);
      console.log("   ✅ Added trademark blacklist settings");
    } catch (error) {
      if (error.code === 11000) {
        console.log("   ⚠️  Trademark settings already exist");
        // Update existing settings
        await db.settings.updateOne(
          { type: "trademark_blacklist" },
          { 
            $set: { 
              patterns: trademarkSettings.patterns,
              updated_at: Math.floor(Date.now() / 1000)
            }
          }
        );
        console.log("   ✅ Updated existing trademark settings");
      } else {
        console.error("   ❌ Error adding trademark settings:", error.message);
      }
    }

    console.log("\n🎉 Database setup completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Update proxy settings in config.js");
    console.log("2. Make sure MongoDB is running");
    console.log("3. Run: npm start");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  }
}

// Run setup
setupDatabase(); 