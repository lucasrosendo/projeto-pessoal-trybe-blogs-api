module.exports = (sequelize, DataTypes) => {
  const PostCategories = sequelize.define('PostCategories', {
    postId: DataTypes.INTEGER,
    categoryId: DataTypes.INTEGER,
  }, {
    timestamps: false,
  });
  return PostCategories;
};