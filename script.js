function totalValue() {
  const items = JSON.parse(window.localStorage.getItem('cartItems'));
  const priceElement = document.querySelector('.total-price');
  if (items) {
    const price = items.reduce((acc, item) => (acc + parseFloat(item.price)), 0);
    priceElement.innerText = price;
  } else {
    priceElement.innerText = 0;
  } 
}

function saveCartList() {
  const cartList = document.querySelectorAll('li.cart__item');
  if (cartList.length > 0) {
    const cartListTextArr = Array.from(cartList).reduce((acc, item) => {
      const id = item.innerText.split('|')[0].replace('SKU:', '').trim();
      const title = item.innerText.split('|')[1].replace('NAME:', '').trim();
      const price = item.innerText.split('|')[2].replace('PRICE: $', '').trim();
      const itemObj = {
        id,
        title,
        price,
      };
      return [...acc, itemObj];
    }, []);
  window.localStorage.setItem('cartItems', JSON.stringify(cartListTextArr));
  } else {
    window.localStorage.setItem('cartItems', null);
  }
  totalValue();
}

async function requestApi(url, callback) {
  try {
    showLoading();
    await fetch(url)
      .then((r) => r.json())
      .then((r) => callback(r))
      .then(() => closeLoading())
      .catch((error) => console.log(error));
  } catch(error) {
    console.log(error);
  }
}

function appendElement(el, className) {
  const parent = document.querySelector(`.${className}`);
  parent.appendChild(el);
}

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText, callback) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  if (callback) {
    callback(e);
  }
  return e;
}

function cartItemClickEvent(item) {
  item.addEventListener('click', () => {
    const parent = item.parentElement;
    parent.removeChild(item);
    saveCartList();
  })
}

function createCartItemElement({ id, title, price }) {
  const elementText = `SKU: ${id} |\nNAME: ${title} |\nPRICE: $${price}`;
  const element = createCustomElement('li', 'cart__item', elementText, cartItemClickEvent);

  appendElement(element, 'cart__items');
  saveCartList();
}

function catalogItemButtonEvent(btn) {
  btn.addEventListener('click', () => {
    const parent = btn.parentElement;
    const id = parent.querySelector('.item__id').innerText;
    const url = `https://api.mercadolibre.com/items/${id}`;
    requestApi(url, createCartItemElement);
  })
}

function createProductItemElement(obj) {
  const { id, title, thumbnail } = obj;
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__id', id));
  section.appendChild(createCustomElement('span', 'item__title', title));
  section.appendChild(createProductImageElement(thumbnail));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!', catalogItemButtonEvent));

  return section;
}

function createCatalog(resolve) {
  resolve.results.forEach((product) => {
    const productElement = createProductItemElement(product);
    appendElement(productElement, 'items');
  });
}

function loadCartList() {
  const storage = JSON.parse(window.localStorage.getItem('cartItems'));
  if (storage) {
    storage.forEach((item) => createCartItemElement(item));
  }
}

function showLoading() {
  const loading = createCustomElement('p', 'loading', 'loading...');
  appendElement(loading, 'cart');
}

function closeLoading() {
  const parent = document.querySelector('.cart');
  const loading = document.querySelector('.loading');
  parent.removeChild(loading);
}

// function emptyCart() {
//   const btn = document.querySelector('.empty-cart');
//   btn.addEventListener('click', () => {
//     const cartList = document.querySelectorAll('li.cart__item');
//     cartList.forEach((item) => item.parentElement.removeChild(item));
//     saveCartList();
//     totalValue();
//   });
// }


// function fetchList(url) {
//   loadingStatus();
//   return new Promise((resolve, reject) => {
//     fetch(url)
//       .then((r) => r.json())
//       .then((obj) => resolve(obj))
//       .then(() => loadingStatus())
//       .catch((err) => reject(err));
//   });
// }

// function getSkuFromProductItem(item) {
//   return item.querySelector('span.item__sku').innerText;
// }



// function cartItems(e) {
//   const target = e.target.parentElement;
//   
//   fetchList(url)
//     .then((r) => createCartItemElement(r))
//     .then(() => {
//       saveCartList();
//       totalValue();
//     })
//     .catch((error) => console.log(error));
//   }

// function cartButtonClickListener() {
//   const btnList = document.querySelectorAll('.item__add');
//   btnList.forEach((btn) => btn.addEventListener('click', cartItems));
// }

window.onload = function onload() {
  const url = 'https://api.mercadolibre.com/sites/MLB/search?q=computador';
  requestApi(url, createCatalog)
    .then(() => loadCartList());
};