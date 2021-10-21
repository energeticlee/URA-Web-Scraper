const puppeteer = require("puppeteer");
const path = require("path");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const uraScraper = async (keyword) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(
    "https://www.ura.gov.sg/realEstateIIWeb/transaction/search.action",
    {
      waitUntil: "networkidle2",
    }
  );

  await page.select(
    "#searchForm_selectedFromPeriodProjectName",
    await page.evaluate(
      () =>
        Array.from(
          document.querySelector("#searchForm_selectedFromPeriodProjectName")
        ).at(-1).value
    )
  );
  await page.select(
    "#searchForm_selectedToPeriodProjectName",
    await page.evaluate(
      () =>
        Array.from(
          document.querySelector("#searchForm_selectedToPeriodProjectName")
        )[0].value
    )
  );

  // await page.waitForSelector("#checkbox1");

  await page.evaluate(() => {
    document.querySelector("#checkbox1").click();
    document.querySelector("#checkbox2").click();
    document.querySelector("#checkbox3").click();
  });

  await page.evaluate((val) => {
    Array.from(document.querySelectorAll("#projectContainerBox a"))
      .filter((sel) => sel.innerText.toLowerCase() === val.toLowerCase())[0]
      .click();
  }, keyword);

  await page.click("#searchForm_0");
  await page.waitForNavigation();

  const downloadPath = path.resolve("./");

  await page._client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: downloadPath,
  });

  await page.click(
    "#SubmitSortForm > div.row.formRow.btnRadioContainer > div:nth-child(3) > input"
  );

  await browser.close();
};

const runScript = () => {
  rl.question(`Select project keyword: `, async (answer) => {
    console.log(
      `Retreiving infomation about ${answer} from URA website... Please wait...`
    );
    try {
      await uraScraper(answer);
      console.log("Requested csv file downloaded in folder!");
      rl.close();
    } catch (error) {
      console.log("Something went wrong, please try again");
      rl.close();
    }
  });
  rl.on("close", () => {
    console.log("Have a great day!");
    process.stdin.unref();
  });
};

module.exports = runScript;
