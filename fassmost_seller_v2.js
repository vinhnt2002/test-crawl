const { ObjectId } = require("mongodb");
const axios = require("axios");
const { HttpsProxyAgent } = require("https-proxy-agent");
const crypto = require("crypto");
const config = require("./config");
const create_db_tiktokshop = require("./lib/db_tiktokshop");
const { oneDayAgo, timeNow } = require("./data/constant");
const { sleep } = require("./old_/src/status_product");
const qs = require("qs");
const { get_trademark } = require("./lib/helps");
const striptags = require("striptags");

const init_fastmoss = () => {
  const encryptParams = (params) => {
    // Sort the keys of the params object
    const sortedKeys = Object.keys(params).sort();

    // Concatenate sorted keys and their values with the salt
    let concatenatedString = "";
    sortedKeys.forEach((key) => {
      concatenatedString += key + params[key] + "asjdfoaur3ur829322";
    });

    // Append additional string to the concatenated string and hash it

    // Perform XOR operation on the hash to create the final encrypted value

    let hash = crypto
        .createHash("md5")
        .update(concatenatedString)
        .digest("hex"), // 'hash' is assigned the value of 't'
      result = "", // 'result' is the string that will be built
      leftIndex = 0, // 'leftIndex' starts at the beginning of the string
      rightIndex = hash.length - 1; // 'rightIndex' starts at the end of the string

    // Loop until the two indices meet or cross each other
    for (
      ;
      leftIndex < hash.length && !(leftIndex >= rightIndex);
      leftIndex++, rightIndex--
    ) {
      const leftValue = parseInt(hash[leftIndex], 16);
      const rightValue = parseInt(hash[rightIndex], 16);
      result += (leftValue ^ rightValue).toString(16);
    }

    // Append the middle part of the hash (if any) to the result
    return result + hash.substring(leftIndex);
  };
  // Create proxy URL with authentication
  const proxyUrl = `http://${config.fastmoss.proxy.username}:${config.fastmoss.proxy.password}@${config.fastmoss.proxy.host}:${config.fastmoss.proxy.port}`;
  
  const instance = axios.create({
    baseURL: config.fastmoss.baseURL,
    params: {
      // region: "US",
      _time: Math.floor(Date.now() / 1e3),
      cnonce: Math.floor(1e7 + 9e7 * Math.random()),
    },
    httpsAgent: new HttpsProxyAgent(proxyUrl),

    
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "en-US,en;q=0.9",
      cookie: "NEXT_LOCALE=en; region=US; utm_country=US; utm_south=google; utm_id=ggfm; fp_visid=ec10676ba005ba2ad0e322e9ea268396; _gcl_aw=GCL.1750676004.EAIaIQobChMIvoKkorCHjgMV-i1ECB2VGy-yEAAYASAAEgJixPD_BwE; _gcl_gs=2.1.k1$i1750675984$u14116896; _gcl_au=1.1.1799899988.1750676004; _ga=GA1.1.1612717656.1750676004; _fbp=fb.1.1750676004748.699180781851569929; _tt_enable_cookie=1; _ttp=01JYE6QS9T0K6JSTHFBWSHH24H_.tt.1; fd_id=uyjCF1iql7LU54GEJT3etNfY6raWAQxD; _ss_s_uid=1dbc9ee57fc6bff97a43791070f1615e; fd_tk_exp=1751972065; fd_tk=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTE5NzIwNjUsInN1YiI6ImM3NmU1N2VhYjNlMjBlMDA5MTY2Yzc3NWRhNDQ4N2JhIiwibmJmIjoxNzUwNjc2MDY1LCJhdWQiOnsib3Blbl9pZCI6IiIsIm5pY2tuYW1lIjoiRmFzdE1vc3PnlKjmiLciLCJwbGF0Zm9ybSI6MSwiZW1haWwiOiJ2aW5odXMyMDAyQGdtYWlsLmNvbSIsInJlZ2lvbiI6IlVTIiwic291cmNlIjoxLCJkb21haW4iOiJ3d3cuZmFzdG1vc3MuY29tIiwidWlkIjoxMDkxNjE2NiwiYmVoYXZpb3IiOjIsImxvZ2luX3NvdXJjZSI6InBjIiwidmlzaXRvcl9pZCI6ImVjMTA2NzZiYTAwNWJhMmFkMGUzMjJlOWVhMjY4Mzk2IiwiZnBfdmlzaWQiOiJhMWVmZGQ2Yjk1NDk0ZDhlYjhjNDI0ZmU3MWIyNGJjZiIsImNyZWF0ZV90aW1lIjoxNzUwNjc2MDY1fSwiaWF0IjoxNzUwNjc2MDY1LCJqdGkiOiJjNzZlNTdlYWIzZTIwZTAwOTE2NmM3NzVkYTQ0ODdiYSIsImlzcyI6Ind3dy5mYXN0bW9zcy5jb20iLCJzdGF0dXMiOjEsImRhdGEiOm51bGx9.v2saTpFZ7QOqUecskcv3gV2U14oh0cAR4BaTVqsLYck; ttcsid=1750676062184::FmPUTimykQb7xZy8fJir.1.1750676062184; _ga_J8P3E5KDGJ=GS2.1.s1750734183$o3$g1$t1750734219$j24$l0$h580045803; _ga_GD8ST04HB5=GS2.1.s1750734183$o3$g1$t1750734220$j23$l0$h449577075; ttcsid_CJOP1H3C77UDO397C3M0=1750734193257::LOeiAP3Yh3QGW96kD0RB.3.1750734220119; _uetsid=493cff50502011f0ab465d4ec662aeb9|1l7wg50|2|fx1|0|2000; _uetvid=493d3150502011f0a35059d89c96cb0e|ua6muh|1750734811801|5|1|bat.bing.com/p/insights/c/n",
      "fm-sign": "encryptor.encryptParams(params, dataString)",
      lang: "EN_US",
      priority: "u=1, i",
      referer: "https://www.fastmoss.com/e-commerce/search?page=1&words=T-shirt",
      region: "US",
      "sec-ch-ua": '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      source: "pc",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
    },
  });

  instance.interceptors.request.use((config) => {
    // console.log(config.params);
    config.headers["fm-sign"] = encryptParams(config.params);
    return config;
  });
  return instance;
};
class SellerCrawler {
  constructor() {
    this.page = 0;
    this.index_ = 0;
    this.db = null;
    this.BLACK_TM = null;
    this.regex = null;
  }

  async init() {
    this.db = await create_db_tiktokshop();
    this.api_f = await init_fastmoss();
    this.BLACK_TM = await get_trademark(this.db.settings, true);
    this.regex = new RegExp(this.BLACK_TM, "im");
    console.log(this.BLACK_TM);
  }

  async crawlSeller() {
    const sellers = await this.db.seller_ids
      .find({
        // fastmoss:null
        $or: [
          { fastmoss: null },
          { fastmoss: { $lt: oneDayAgo + 86400 } },
        ],
        // seller_id:''
      })
      .sort("fastmoss", 1)
      .limit(1)
      .toArray();
    console.log(sellers.length);

    for (const seller of sellers) {
      // console.log(seller.seller_id);
      await this.crawlSellerProductsFastmoss(seller);
    }
    if (sellers.length == 0) await sleep(3600 * 1000);
    return await this.crawlSeller(); // Recursion to continue crawling
  }
  async startKeyword() {
    const keywords = await this.db.keywords
      .find({
        $or: [
          { fastmoss: null },
          { fastmoss: { $lt: oneDayAgo + 86400 } },
        ],
        // seller_id:''
      })
      .sort("fastmoss", 1)
      .limit(1)
      .toArray();
    console.log(keywords.length);
    for (const keyword of keywords) {
      // console.log(seller.seller_id);
      console.log("start", keyword.keyword);
      await this.crawlKeyword(keyword.keyword);
    }
    if (keywords.length == 0) return;
    return await this.startKeyword(); // Recursion to continue crawling
  }

  async handlerProductGet(data, successfulInserts = 0) {
    for (const product_ of data) {
      if (this.shouldSkipProduct(product_)) continue;
      const product = this.createProductObject(product_);
      if (
        product.createTime < timeNow() - 30 * 86400 &&
        product.week_sold_count == 0
      )
        continue;
      try {
        await this.db.tiktoks.insertOne(product);
        successfulInserts++;
        console.log(product.product_id, product.week_sold_count);
      } catch (error) {
        await this.updateExistingProduct(product_);
      }
    }

    const noMoreProducts =
      data.length === 0 || this.noSalesInResponse(data);

    return {
      noMoreProducts,
      successfulInserts,
    };
  }

  async crawlSellerProductsFastmoss(
    seller,
    page = 1,
    successfulInserts = 0
  ) {
    try {
      await sleep(config.delays.requestDelay);
      this.index_++;
      // console.log("index", this.index_, page, successfulInserts);
      const r = await this.api_f.get(`/api/shop/v2/goods/`, {
        params: qs.parse(
          `id=${seller.seller_id}&page=${page}&pagesize=10&date_type=-1&order=3,2`
        ),
      });

      // console.log(r.data)
      if (r.data.code == "MAG_AUTH_3002") {
        console.log(r.data);
        await sleep(config.delays.retryDelay);
        return;
      }
      // console.log(r.data.data)
      if (r.data.code == 403) {
        console.log(r.data);
        process.exit();
      }
      const data = await this.handlerProductGet(
        r.data.data.product_list ?? [],
        successfulInserts
      );
      successfulInserts = data.successfulInserts;
      if (data.noMoreProducts) {
        console.log(
          `Shop ${seller.seller_id} finished with ${successfulInserts} successful inserts.`
        );
        await this.db.seller_ids.updateOne(
          { _id: seller._id },
          {
            $set: { fastmoss: timeNow() },
            $inc: {
              fastmoss_count: successfulInserts,
            },
          }
        );
        return;
      }

      await this.crawlSellerProductsFastmoss(
        seller,
        page + 1,
        successfulInserts
      );
    } catch (error) {
      console.error("Error:", error.message);
      // console.error(r.data);
      console.error("Successful Inserts:", successfulInserts);
    }
  }

  async crawlKeyword(keyword, page = 1, successfulInserts = 0) {
    console.log(keyword, page, successfulInserts);
    try {
      await sleep(config.delays.requestDelay);
      const r = await this.api_f.get(`/api/goods/V2/search/`, {
        params: qs.parse(
          `page=${page}&pagesize=10&order=3,2&region=US&words=${encodeURI(
            keyword
          )}&columnKey=3&field=sold_count_show`
        ),
      });
      const data = await this.handlerProductGet(
        r.data.data.product_list ?? [],
        successfulInserts
      );
      // console.log(r.data);
      successfulInserts = data.successfulInserts;
      if (data.noMoreProducts) {
        console.log(
          `${keyword}: finished with ${successfulInserts} successful inserts.`
        );
        await this.db.keywords.updateOne(
          { keyword: keyword },
          {
            $set: { fastmoss: timeNow() },
            $inc: {
              fastmoss_count: successfulInserts,
            },
          }
        );
        return;
      }

      await this.crawlKeyword(keyword, page + 1, successfulInserts);
    } catch (error) {}
  }

  shouldSkipProduct(product_) {
    return (
      product_.title.search(/shirt|hoodie/gim) === -1 ||
      product_.title.search(this.regex) > -1
    );
  }

  createProductObject(product_) {
    const status = this.regex.test(product_.title) ? "black" : null;
    return {
      product_id: product_.id,
      title: striptags(product_.title),
      week_sold_count: product_.sold_count ?? 0,
      source: "fastmoss",
      createTime: product_.ctimestamp ?? 0,
      seller_id: product_.shop_info.seller_id,
      status,
    };
  }

  async updateExistingProduct(product_) {
    await this.db.tiktoks.updateOne(
      { product_id: product_.id },
      {
        $set: {
          week_sold_count: Math.max(product_.sold_count ?? 0, 0),
        },
      }
    );
  }

  noSalesInResponse(data) {
    return (
      data.filter((e) => parseInt(e.sold_count ?? 0) > 0).length === 0
    );
  }

  async run() {
    await this.init();
    this.crawlSeller();
    this.startKeyword();
  }
}

(async () => {
  const sellerCrawler = new SellerCrawler();
  await sellerCrawler.run();
  // await sellerCrawler.crawlSeller()
})();
