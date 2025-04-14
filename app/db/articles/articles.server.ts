import glossary from "~/lib/glossary";
import { client } from "../db-client.server";
import { Article, StatusResponse } from "~/types/types";

const createArticle = (
  article: Article,
  dbUrl: string
): Promise<StatusResponse<any>> => {
  const db = client(dbUrl);
  return new Promise((resolve, reject) => {
    db.article
      .create({
        data: article,
      })
      .then(() => {
        resolve({
          status: "success",
          message: glossary.status_response.success.article_added,
        });
      })
      .catch((error: any) => {
        console.log("ERROR [createArticle]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.article_added,
        });
      });
  });
};

const getAllArticles = (dbUrl: string): Promise<StatusResponse<Article>> => {
  const db = client(dbUrl);
  return new Promise((resolve, reject) => {
    db.article
      .findMany()
      .then((res) => {
        resolve({ status: "success", data: res });
      })
      .catch((error: any) => {
        console.log("ERROR [getAllArticles]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.general,
        });
      });
  });
};

const getArticleBySlug = (slug: string, dbUrl: string) => {
  const db = client(dbUrl);
  return new Promise((resolve, reject) => {
    db.article
      .findFirstOrThrow({
        where: { id:slug }
      })
      .then((res) => {
        resolve({ status: "success", data: res });
      })
      .catch((error: any) => {
        console.log("ERROR [getArticle]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.general,
        });
      });
  });
};

const updateArticle = ( article: Article, dbUrl: string) => {
  const db = client(dbUrl);
  return new Promise((resolve, reject) => {
    db.article
      .update({
          where: { id: article.id },
        data: article,
      })
      .then(() => {
        resolve({
          status: "success",
          message: glossary.status_response.success.article_updated,
        });
      })
      .catch((error: any) => {
        console.log("ERROR [updateArticle]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.article_updated,
        });
      });
  });
};

const deleteArticle = (articleId: string, dbUrl: string) => {
  const db = client(dbUrl);
  return new Promise((resolve, reject) => {
    db.article
      .delete({
        where: { id: articleId },
      })
      .then(() => {
        resolve({
          status: "success",
          message: glossary.status_response.success.article_deleted,
        });
      })
      .catch((error: any) => {
        console.log("ERROR [deleteArticle]: ", error);
        reject({
          status: "error",
          message: glossary.status_response.error.article_deleted,
        });
      });
  });
};

export default {
  createArticle,
  updateArticle,
  getAllArticles,
  getArticleBySlug,
  deleteArticle
};