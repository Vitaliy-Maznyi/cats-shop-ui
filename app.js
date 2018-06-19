let querySetting = {
  page: 1,
  perPage: 30
}

requestItems = () => {
  const request = new XMLHttpRequest();
  request.open(
    'GET',
    `https://ma-cats-api.herokuapp.com/api/cats?page=${querySetting.page}&per_page=${querySetting.perPage}`,
    true,
  );
  request.onload = () => {
    if (request.status >= 200 && request.status < 400) {
      const data = JSON.parse(request.responseText);
      querySetting.page += 1;
      this.createItems(data.cats)
    }
  };

  request.onerror = () => 'Oh, something went wrong...';
  request.send();
}

createItems = (cats) => {
  cats.forEach((cat) => {
    const catCard = this.createItem(cat);
    document.querySelector('.catalog').appendChild(catCard);
  });
}

createItem = (cat) => {
  const template = document.getElementById('cat-template').content.firstElementChild.cloneNode(true);

  template.querySelector('.cat__name').innerHTML = cat.name;
  template.querySelector('.cat__img').setAttribute('alt', `Cat #${cat.id} ${cat.name}`);
  template.querySelector('.cat__img').setAttribute('src', cat.img_url);
  template.querySelector('.cat__price').innerHTML = this.price_humanize(cat.price);
  template.querySelector('.cat__category').children[1].innerHTML = cat.category;

  return template;
}

price_humanize = (price) => {
  const res = price / 100.00
  return `$${res}`
}

document.addEventListener("DOMContentLoaded", requestItems)
