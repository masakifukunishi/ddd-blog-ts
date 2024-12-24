import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { ArticleApplicationService } from "../../application/services/ArticleApplicationService";
import { CreateArticleCommand } from "../../application/commands/CreateArticleCommand";
import { ValidationError } from "../../application/errors/ValidationError";

export class ArticleController {
  constructor(private readonly articleApplicationService: ArticleApplicationService) {}

  static validations = {
    createArticle: [
      body("title")
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ max: 100 })
        .withMessage("Title must be less than 100 characters"),
      body("content").notEmpty().withMessage("Content is required"),
      body("userId").isInt().withMessage("Valid user ID is required"),
    ],
  };

  async create(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ValidationError.fromExpressValidationErrors(errors.array());
    }

    const command = new CreateArticleCommand(req.body.title, req.body.content, parseInt(req.body.userId));

    const article = await this.articleApplicationService.createArticle(command);
    res.status(201).json(article);
  }

  async get(req: Request, res: Response): Promise<void> {
    const articleId = parseInt(req.params.id);
    const article = await this.articleApplicationService.getArticle(articleId);
    res.json(article);
  }

  async getUserArticles(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.userId);
    const articles = await this.articleApplicationService.getUserArticles(userId);
    res.json(articles);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const articleId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);

    await this.articleApplicationService.deleteArticle(articleId, userId);
    res.status(204).send();
  }
}
