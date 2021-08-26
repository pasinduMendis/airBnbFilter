const puppeteer = require('puppeteer')
const readline = require('readline')
const EventEmmiter = require('events')
const AirBnbProperty = require('./hostDetailsSchema')
const saver = require('./saver')
const emitter = new EventEmmiter()
emitter.setMaxListeners(0)

var filter = ''
const name = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})
async function filterData() {
  name.question('enter host name : ', (answer1) => {
    filter = answer1

    name.close()
    dataPage()
  })
}

async function mainPage() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(
    'https://www.airbnb.com/s/Portugal/homes?place_id=ChIJ1SZCvy0kMgsRQfBOHAlLuCo&refinement_paths%5B%5D=%2Fhomes&adults=0&children=0&infants=0&search_type=AUTOSUGGEST'
  )

  await page.waitForSelector('._wy1hs1')

  const names = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a._wy1hs1')).map((x) => x.href)
  })

  console.log(names)

  await browser.close()
  return names
}

async function hotelPage() {
  const links = await mainPage()
  const hotelLinks = []
  const bedRooms = []
  const beds = []
  const baths = []
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setDefaultNavigationTimeout(0)
  var count = 1
  for (let link of links) {
    await page.goto(link)

    console.log(count)
    count = count + 1
    await page.waitForSelector('._mm360j')

    const hotelLink = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a._mm360j')).map(
        (x) => x.href
      )
    })

    await page.waitForSelector('div._12oal24')

    const bedRooms = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(
          'div._12oal24 div:nth-child(3) span:nth-child(3)'
        )
      ).map((x) => x.textContent)
    })

    const beds = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(
          'div._12oal24 div:nth-child(3) span:nth-child(5)'
        )
      ).map((x) => x.textContent)
    })

    const baths = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(
          'div._12oal24 div:nth-child(3) span:nth-child(7)'
        )
      ).map((x) => x.textContent)
    })
    var num = 0
    for (let hotel of hotelLink) {
      const obj = {
        link: hotel,
        beds: beds[num],
        baths: baths[num],
        bedRooms: bedRooms[num],
      }
      await hotelLinks.push(obj)
      //console.log(num)
      num = num + 1
    }
  }
  await browser.close()
  // await fs.writeFile('nameHotels.txt', hotelLinks.join('\r\n'))
  await console.log(hotelLinks)
  return hotelLinks
}

async function dataPage() {
  const links = await hotelPage()
  var property_num = 1
  const data = []
  var testId = 0

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setDefaultNavigationTimeout(0)
  console.log(filter)
  for (let link of links) {
    testId = testId + 1
    console.log(testId)

    await page.goto(link.link)
    //console.log('**')
    await page.waitForSelector('._fecoyn4', {
      waitUntil: 'load',
      timeout: 0,
    })

    const titles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h1._fecoyn4')).map(
        (x) => x.textContent
      )
    })

    try {
      await page.waitForSelector('h2._14i3z6h', {
        waitUntil: 'load',
        timeout: 50000,
      })
    } catch (err) {
      console.log('error')
    }
    //console.log('***')

    const hostNames = await page.evaluate(() => {
      try {
        return Array.from(document.querySelectorAll('h2._14i3z6h')).map(
          (x) => x.textContent
        )
      } catch (err) {
        console.log('error')
      }
    })

    var host = ''

    var hName = hostNames[0]
    var b = hName.split(' ')
    if (b[0] == 'meet' || b[0] == 'Meet') {
      var c = hName.split('Host, ')
      host = c[1]
    } else {
      var c = hName.split('hosted by')
      var e = c.length
      var d = c[e - 1].split('')
      // console.log(d)
      for (let i = 1; i < d.length; i++) {
        host = host + d[i]
      }
    }

    //console.log(host)

    await console.log('checking...' + host)

    if (host == filter) {
      try {
        //console.log('*')
        await page.waitForSelector(
          '#site-content > div > div:nth-child(1) > div:nth-child(6) > div > div > div > div:nth-child(2) > section > div._88xxct > div._1byskwn > div._5zvpp1l',
          {
            waitUntil: 'load',
            timeout: 50000,
          }
        )
        //console.log('done')
      } catch (err) {
        console.log('error')
      }

      const policy = await page.evaluate(() => {
        try {
          console.log('try')
          return Array.from(
            document.querySelectorAll('div._5zvpp1l > div > div._1y2qkg')
          ).map((x) => x.textContent)
        } catch {
          // console.log('policy number not defined')
          return ['00: undifined']
        }
      })

      var policyNum = policy[0].split('number:')[1]

      try {
        await page.waitForSelector(
          '#site-content > div > div:nth-child(1) > div:nth-child(4) > div > div > div > div:nth-child(2) > div:nth-child(2) > div > div.ciubx2o',
          {
            waitUntil: 'load',
            timeout: 50000,
          }
        )
      } catch (err) {
        console.log('error')
      }
      //console.log('*')

      const ratings = await page.evaluate(() => {
        try {
          return Array.from(
            document.querySelectorAll(
              'div.ciubx2o div._1s11ltsf div._bgq2leu span._4oybiu'
            )
          ).map((x) => x.textContent)
        } catch (err) {
          console.log('error')
        }
      })

      const obj = {
        Host_Name: host,
        No: property_num,
        Property_Name: titles[0],
        policy_num: policyNum,
        Cleanliness_Ratings: ratings[0],
        Accuracy_Ratings: ratings[1],
        Communication_Ratings: ratings[2],
        Location_Ratings: ratings[3],
        Checkin_Ratings: ratings[4],
        Value_Ratings: ratings[5],
        Beds: link.beds,
        Baths: link.baths,
        BedRooms: link.bedRooms,
      }
      await data.push(obj)
      console.log(obj)
      const dataB = new AirBnbProperty(obj)
      dataB.save()
      property_num = property_num + 1
    }

    //const hostName = new AirBnbHost(dataHost)
    //hostName.save()
  }

  await browser.close()
  console.log(data)
}
setTimeout(filterData, 1000)
