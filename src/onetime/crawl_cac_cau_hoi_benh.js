const cheerio = require("cheerio");
const got = require("got");
const fs = require("fs");
const path = require("path");
const { CrawlQuestionModel } = require("../db/models");
const { NodeHelper } = require("../lib/node_helper");
const R = require("ramda");
const LINK = "https://medlatec.vn/hoi-dap/";
let DOMAIN = `https://medlatec.vn`;
let dataCrawl = {
  link_category: [],
  link_cate_with_page: {},
  link_question: [],
  dataToExport: {
    c9: [],
  },
};
function get_link_category($document) {
  let data = [];

  $document(
    "body > div.faq-page.faq-archive.container > div > div.faq-page--col.col-xl-3.d-none.d-xl-block > div > ul > li > a"
  ).map(function () {
    let $this = $document(this);
    data.push({
      text: $this.text().trim(),
      href: $this.attr("href"),
      category: $this.attr("href").split("-").pop().replace("/", ""),
    });
  });
  return data;
}
function link_category_with_page($document, category) {
  let start_page = 1;
  let lastPage = $document(
    "body > div.faq-page.faq-archive.container > div > div.faq-page--col.col-xl-6.col-lg-8 > div > div > div.container > nav > ul > li:last-child > a"
  )
    .attr("href")
    .split("/")
    .pop();
  let data = [];
  lastPage = Number(lastPage);
  for (let i = 1; i <= lastPage; i++) {
    data.push(`https://medlatec.vn/hoi-dap/a-${category}/${i}`);
  }
  return data;
}

function get_question_links($document) {
  let data = [];

  $document(
    "body > div.faq-page.faq-archive.container > div > div.faq-page--col.col-xl-6.col-lg-8 > div > div > div > div > a"
  ).map(function () {
    let $this = $document(this);
    data.push({ text: $this.text().trim(), href: $this.attr("href").trim() });
  });
  return data;
}

function get_data(url, $document) {
  let _url = url.replace("#traloi", "");
  let temp = _url.split("-");
  let q_id = temp[temp.length - 1];
  let c_id = temp[temp.length - 2];

  let q_title = $document(
    "body > div.faq-page.faq-detail.container > div > div.faq-page--col.col-xl-6.col-lg-8 > div > h1"
  ).text();
  let q_content = $document(
    "body > div.faq-page.faq-detail.container > div > div.faq-page--col.col-xl-6.col-lg-8 > div > div.faq-detail--question > div > div > div.faq-archive--desc"
  ).text();

  let q_related = [];

  $document(
    `body > div.faq-page.faq-detail.container > div > div.faq-page--col.col-xl-6.col-lg-8 > div > div.faq-related > ul > li > div > h2 > a`
  ).map(function () {
    let $this = $document(this);
    q_related.push({ text: $this.text(), href: $this.attr("href") });
  });

  let question = {
    c_id,
    q_id,
    q_content,
    q_related,
    q_title,
  };
  return question;
}

async function getDocument(LINK) {
  try {
    let res = await got(LINK);
    let initDocument = res.body;
    return cheerio.load(initDocument);
  } catch (err) {
    console.log(err);
  }
}
async function get_list_link_question() {
  dataCrawl.link_category = get_link_category(await getDocument(LINK));

  let pathToSave = NodeHelper.getPathFromProject(`/local_data/crawl_md_question/ls_cate.json`);
  await fs.promises.writeFile(pathToSave, JSON.stringify(dataCrawl.link_category), "utf-8");
  await Promise.all(
    dataCrawl.link_category.map(async (categoryPage) => {
      let category = categoryPage.category;
      dataCrawl.link_cate_with_page[category] = link_category_with_page(
        await getDocument(`${DOMAIN}${dataCrawl.link_category[0].href}`),
        category
      );

      for (let i = 0; i < dataCrawl.link_cate_with_page[category].length; i++) {
        let page_link = dataCrawl.link_cate_with_page[category][i];
        let pageDoc = await getDocument(page_link);
        let currentPage = i + 1;
        let activePage = pageDoc(
          "body > div.faq-page.faq-archive.container > div > div.faq-page--col.col-xl-6.col-lg-8 > div > div > div.container > nav > ul > li.page-item.active"
        ).text();
        let question_links = get_question_links(pageDoc);

        if (currentPage != activePage) {
          break;
        }
        dataCrawl.link_question = dataCrawl.link_question.concat(
          question_links
        );
        console.log(`Page ${category}: `, currentPage, "-- length:", dataCrawl.link_question.length);
      }
    })
  );

  let pathToSave3 = NodeHelper.getPathFromProject(`/local_data/crawl_md_question/link_question.json`);
  await fs.promises.writeFile(pathToSave3, JSON.stringify(dataCrawl.link_question), "utf-8");

}

async function get_all_question() {
  let linksQuestion = require("./link_question.pt.json");

  // insert db
  for (let i = 0; i < linksQuestion.length; i++) {
    try {
      await CrawlQuestionModel.create({ question_link: linksQuestion[i].href });
    } catch (err) {
      console.log(err);
    }
  }
  // console.log("Xong db");
  while (true) {
    let allQuestion = await CrawlQuestionModel.find({
      status: { $nin: [2, 3] },
    }).limit(20);
    if (allQuestion.length === 0) {
      console.log("Done");
      return true;
    }
    await Promise.all(
      allQuestion.map(async (question_detail) => {
        let link = `${DOMAIN}${question_detail.question_link.replace(
          "/hoi-dap/",
          "/hoi-dap/xxx-"
        )}`;

        let document;
        try {
          document = await getDocument(link);
          let question = get_data(link, document);
          await CrawlQuestionModel.findByIdAndUpdate(question_detail.id, { ...question, status: 2,
          });
          console.log(question_detail.question_link, "----", question.q_title, "---", question.q_id);
        } catch (e) {
          await CrawlQuestionModel.findByIdAndUpdate(question_detail.id, { status: 3, });
          console.log(e);
        }
      })
    );
  }
}
// main_do_get();
async function do_export() {
  let allQuestion = await CrawlQuestionModel.find({ status: 2 }).lean();
  let dataExport = R.groupBy((item) => item.c_id, allQuestion);
  let lsEntries = Object.entries(dataExport);
  for (let i = 0; i < lsEntries.length; i++) {
    let [cate, ls_question] = lsEntries[i];
    let pathToSave = NodeHelper.getPathFromProject(
      `/local_data/crawl_md_question/${cate}.pt.json`
    );
    // let pathToSave2 = NodeHelper.getPathFromProject(
    //   `/local_data/crawl_md_question/${cate}.pt.json`
    // );
    await fs.promises.writeFile(
      pathToSave,
      JSON.stringify(ls_question,null,4),
      "utf-8"
    );
    // await NodeHelper.runCmd(`jq '.' ${pathToSave} > ${pathToSave2}`);
  }
}

async function main(){
  let allParams = NodeHelper.getAllCmdParams();
  try{
    let stage = allParams["stage"]
    if (stage <= 1) {
      await get_list_link_question()
    }
    if (stage <= 2) {
      await get_all_question()
    }
    if (stage <= 3) {
      await do_export()
    }
    process.exit("Done")
  }catch(err){
    console.log(err)
  }

}
main()