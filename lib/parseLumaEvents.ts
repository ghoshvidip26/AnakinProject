import * as cheerio from "cheerio";

export function parseLumaEvents(html: string) {
  const $ = cheerio.load(html);

  const events: any[] = [];

  $(".event-link").each((_, el) => {
    const parent = $(el).closest(".content-card");

    const title = parent.find("h3").first().text().trim();

    const url = $(el).attr("href");

    const time = parent
      .find(".event-time span")
      .first()
      .text()
      .trim();

    const venue = parent
      .find(".text-ellipses")
      .last()
      .text()
      .trim();

    const organizer = parent
      .find(".nowrap")
      .first()
      .text()
      .trim();

    const image = parent.find("img").first().attr("src");

    events.push({
      title,
      url,
      time,
      venue,
      organizer,
      image,
    });
  });

  return events;
}