const deleteProd = (btn) => {
  console.log("clicked");
  const prodId = btn.parentNode.querySelector("[name=id]").value;
  const csrfToken = btn.parentNode.querySelector("[name=_csrf]").value;
  const product = btn.closest("article");

  fetch("/admin/product/" + prodId, {
    method: "DELETE",
    headers: {
      "csrf-token": csrfToken,
    },
  })
    .then((res) => {
      console.log(res);
      return res.json();
    })
    .then((data) => {
      console.log(data);
      product.parentNode.removeChild(product);
    })
    .catch((err) => {
      console.log(err);
    });
};
