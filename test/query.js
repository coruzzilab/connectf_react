/**
 * @author zacharyjuang
 */
const {Builder, By, until, Browser} = require('selenium-webdriver');
const {assert} = require('chai');
const axios = require('axios');

let driver = new Builder()
  .forBrowser(Browser.CHROME)
  .build();

describe('Query', async function () {
  this.timeout(10000);
  this.slow(5000);

  it('should load query page', async function () {
    this.slow(2000);
    await driver.get("http://localhost:8080/query");
    await driver.findElement(By.name('query'));
  });

  it('should autocomplete TGA1', async function () {
    let tga1 = By.xpath("//*[contains(@class, 'dropdown-item') and contains(text(), 'AT5G65210')]");
    this.slow(1000);

    await driver.findElement(By.name('query')).sendKeys('tga1');
    await driver.wait(until.elementLocated(tga1)).click();

    await driver.findElement(By.name('query')).getAttribute('value').then((value) => {
      assert.strictEqual(value, 'AT5G65210');
    });
  });

  it('should return query results', async function () {
    await driver.findElement(By.css('button#submit')).click();
    await driver.wait(until.urlMatches(/\/result\/summary$/));
    await driver.findElement(By.id('result'))
      .catch(function () {
        assert.fail("Results not loaded.");
      });
  });

  it('should display bar chart', async function () {
    await driver.findElement(By.css('canvas.chartjs-render-monitor'))
      .catch(function () {
        assert.fail("Bar chart not found.");
      });
  });

  it('should display result table', async function () {
    await driver.findElement(By.xpath("//a[contains(@class, 'nav-link') and (text()='Table')]")).click();
    await driver.getCurrentUrl().then(function (value) {
      assert.match(value, /\/result\/table$/, 'navigated to table');
    });
    await driver.wait(until.elementLocated(By.css('div#grid > *.handsontable table')), 5000);
  });

  it('should display metadata table', async function () {
    await driver.findElement(By.xpath("//a[contains(@class, 'nav-link') and (text()='Metadata')]")).click();
    await driver.getCurrentUrl().then(function (value) {
      assert.match(value, /\/result\/meta$/, 'navigated to metadata');
    });
    await driver.wait(until.elementLocated(By.css('div#grid > *.handsontable table')), 5000);
  });

  it('should display network page', async function () {
    this.timeout(30000);

    await driver.findElement(By.xpath("//a[contains(@class, 'nav-link') and (text()='Network')]")).click();
    await driver.getCurrentUrl().then(function (value) {
      assert.match(value, /\/result\/network$/, 'navigated to network');
    });
    await driver.wait(until.elementLocated(By.xpath("//a[@download and @href and contains(text(), 'Download')]")));
  });

  it('should display target enrichment', async function () {
    await driver.findElement(By.xpath("//a[contains(@class, 'nav-link') and (text()='Target Enrichment')]")).click();
    await driver.getCurrentUrl().then(function (value) {
      assert.match(value, /\/result\/target$/, 'navigated to target enrichment');
    });
  });

  it('should display motif enrichment', async function () {
    await driver.findElement(By.xpath("//a[contains(@class, 'nav-link') and (text()='Motif Enrichment')]")).click();
    await driver.getCurrentUrl().then(function (value) {
      assert.match(value, /\/result\/motif$/, 'navigated to motif enrichment');
    });
    await driver.wait(until.elementsLocated(By.css('table > tbody > tr'))).then(function (eles) {
      assert.isAbove(eles.length, 0, 'has enriched motifs');
    });
  });

  it('should display analysis enrichment', async function () {
    this.timeout(30000);
    this.slow(10000);

    await driver.findElement(By.xpath("//a[contains(@class, 'nav-link') and (text()='Analysis Enrichment')]")).click();
    await driver.getCurrentUrl().then(function (value) {
      assert.match(value, /\/result\/analysis$/, 'navigated to analysis enrichment');
    });
    await driver.wait(until.elementsLocated(By.css('.cell'))).then(function (eles) {
      assert.isAbove(eles.length, 1);
    });
  });

  it('should display export', async function () {
    this.timeout(30000);

    await driver.findElement(By.xpath("//a[contains(@class, 'nav-link') and (text()='Download')]")).click();
    await driver.getCurrentUrl().then(function (value) {
      assert.match(value, /\/result\/download$/, 'navigated to download');
    });
    await driver.wait(until.elementLocated(By.xpath("//a[@href and @download and contains(text(), 'Download')]"))).getAttribute('href')
      .then(function (value) {
        return axios.get(value);
      }).then(function (resp) {
        assert.strictEqual(resp.status, 200, 'is OK');
        assert.strictEqual(resp.headers['content-type'], 'application/zip', 'is zip file');
      });
  });

  after(async function () {
    return await driver.quit();
  });
});
