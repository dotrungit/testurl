<script src="https://cdn.rawgit.com/oliver-moran/jimp/v0.2.27/browser/lib/jimp.min.js"></script>
<script>
Jimp.read("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTv_kZid4hWujHinz7j_G44EKwAzVfNUgPz3fJ1AHKFyg9w0SfplF8sNQ_qKCTcUVJOgO0&usqp=CAU").then(function (lenna) {
    lenna.quality(100)                 // set JPEG quality
         .greyscale()                 // set greyscale
  			 .contrast(1)
         .getBase64(Jimp.MIME_JPEG, function (err, src) {
              var img = document.createElement("img");
              img.setAttribute("src", src);
              document.body.appendChild(img);
							src.write("new-image.bmp")
         });
}).catch(function (err) {
    console.error(err);
});
</script>
