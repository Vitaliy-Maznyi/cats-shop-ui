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
      createItems(data.cats);
      initLazyLoad();
    }
  };

  request.onerror = () => 'Oh, something went wrong...';
  request.send();
}

createItems = (cats) => {
  cats.forEach((cat) => {
    const catCard = createItem(cat);
    document.querySelector('.catalog').appendChild(catCard);
  });
}

createItem = (cat) => {
  const template = document.getElementById('cat-template').content.firstElementChild.cloneNode(true);

  template.setAttribute('data-id', cat.id);
  template.querySelector('.cat__name').innerHTML = cat.name;
  template.querySelector('.cat__img').setAttribute('alt', `Cat #${cat.id} ${cat.name}`);
  template.querySelector('.cat__img').setAttribute('data-src', cat.img_url);
  template.querySelector('.cat__price').innerHTML = price_humanize(cat.price);
  template.querySelector('.cat__category').children[1].innerHTML = cat.category;

  return template;
}

price_humanize = (price) => {
  const res = price / 100.00;
  return `$${res}`
}

loadMore = () => {
  if (document.documentElement.scrollTop + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
    requestItems();
  }
}

initLazyLoad = () => {
  setLazy();
  lazyLoad();
}


let lazyImages = [];

setLazy = () => {
  lazyImages = document.querySelectorAll("[data-lazy]");
}

lazyLoad = () => {
  for(let i=0; i<lazyImages.length; i++){
    if(isInViewport(lazyImages[i])){
      if (lazyImages[i].getAttribute('data-src')){
        lazyImages[i].src = lazyImages[i].getAttribute('data-src');
        lazyImages[i].removeAttribute('data-src');
        lazyImages[i].parentElement.classList.remove('cat__photo--noimage');
      }
    }
  }

  cleanLazy();
}

cleanLazy = () => {
  lazyImages = Array.prototype.filter.call(lazyImages, (l) => {
    return l.getAttribute('data-src');
  });
}

isInViewport = (el) => {
  const rect = el.getBoundingClientRect();

  return (
    rect.bottom >= 0 &&
    rect.right >= 0 &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

document.addEventListener("DOMContentLoaded", requestItems)
document.addEventListener("scroll", loadMore)
document.addEventListener("scroll", initLazyLoad)
