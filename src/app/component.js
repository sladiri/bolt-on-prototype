// @ts-check
import maleIcon from "../svg/danger-3.svg";
import femaleIcon from "../svg/danger-1.svg";
import getUsers from "./babel-test";

const getSVG = symbol => {
  const useSVG = document.createElementNS("http://www.w3.org/2000/svg", "use");
  useSVG.setAttributeNS(
    "http://www.w3.org/1999/xlink",
    "href",
    `#${symbol.id}`
  );

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute(
    "style",
    "width:1em;height:1em;vertical-align:middle;margin-right:0.25em;fill:#333;"
  );
  svg.appendChild(useSVG);
  return svg;
};

const createListItem = list => user => {
  const svg = getSVG(user.gender === "male" ? maleIcon : femaleIcon);
  const text = document.createTextNode(`${user.name.first} ${user.name.last}`);

  const span = document.createElement("span");
  span.setAttribute("style", "line-height:1em;");
  span.appendChild(svg);
  span.appendChild(text);

  const item = document.createElement("li");
  item.appendChild(span);

  list.appendChild(item);
};

export default async () => {
  const limit = 5;

  const header = document.createElement("h1");
  header.innerHTML = "Hello world!";
  document.body.appendChild(header);

  document.body.appendChild(
    document.createTextNode(`Fetching at most ${limit} old users ...`)
  );

  const list = document.createElement("ul");
  list.setAttribute(
    "style",
    "list-style:none;font-size:1.2em;padding-left:0.2em;"
  );
  document.body.appendChild(list);

  const result = await getUsers({
    limit,
    delay: 1000,
    target: createListItem(list)
  });

  document.body.appendChild(
    document.createTextNode(`... ${result.length} users in result.`)
  );
};
