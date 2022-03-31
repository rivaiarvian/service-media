const { Media } = require("../models");

const isBase64 = require("is-base64");
const base64Img = require("base64-img");
const fs = require("fs");

module.exports = {
  index: async (req, res) => {
    try {
      const media = await Media.findAll({
        attributes: ["id", "image"],
      });

      const mapMedia = media.map((m) => {
        m.image = `${req.get("host")}/${m.image}`;
        return m;
      });

      return res.status(200).json({
        message: "success",
        data: mapMedia,
      });
    } catch (error) {
      console.log("error:", error);
    }
  },
  create: async (req, res) => {
    try {
      const image = req.body.image;

      if (!isBase64(image, { mimeRequired: true })) {
        return res
          .status(400)
          .json({ status: "error", message: "invalid base64" });
      }

      base64Img.img(
        image,
        "./public/images",
        Date.now(),
        async (err, filepath) => {
          if (err) {
            return res.status(400).json({
              status: "error",
              message: err.message,
            });
          }

          const filename = filepath.split("\\").pop().split("/").pop();

          const media = await Media.create({ image: `images/${filename}` });

          return res.status(200).json({
            status: "success",
            data: {
              id: media.id,
              image: `${req.get("host")}/images/${filename}`,
            },
          });
        }
      );
    } catch (error) {
      console.log("error:", error);
    }
  },
  deleted: async (req, res) => {
    try {
      const { id } = req.params;

      const media = await Media.findByPk(id);
      if (!media) {
        return res.status(404).json({
          status: "error",
          message: "Media not found",
        });
      }

      fs.unlink(`./public/${media.image}`, async (err) => {
        if (err) {
          return res.status(400).json({
            status: "error",
            message: err.message,
          });
        }

        await media.destroy();

        return res.status(200).json({
          status: "success",
          message: "Image deleted",
        });
      });
    } catch (error) {
      console.log("error:", error);
    }
  },
};
