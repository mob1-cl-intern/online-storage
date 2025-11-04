<!-- 73b45456-c0ca-43cf-909e-33b86702236a ddbed5d9-12bc-4374-92d8-638c48e4fe1e -->
# バックエンドAPI実装プラン

## 1. プロジェクト構造の構築

レイヤードアーキテクチャに従って以下のフォルダ構造を作成：

- `Domain/Models`: User, FileMetadata, Folder, FileTag
- `Domain/Interfaces`: IUserRepository, IFileRepository, IFolderRepository, ITagRepository
- `Infrastructure/Repositories`: MongoDB用の各リポジトリ実装
- `Infrastructure/Services`: FileStorageService (upload-dir管理)
- `Application/Services`: AuthService, FileService, FolderService, TagService
- `Application/Interfaces`: 各サービスのインターフェース
- `Presentation/Controllers`: AuthController, FilesController, FoldersController, TagsController
- `Presentation/DTOs`: リクエスト/レスポンス用のDTO

## 2. MongoDB設定

- `appsettings.json`にMongoDB接続文字列を追加（mongodb://mongo:27017、データベース名：ofs）
- MongoDBコンテキストクラスを作成し、コレクション定義

## 3. JWT認証の実装

- JwtSettings設定クラス
- トークン生成・検証サービス
- Program.csでJWT認証ミドルウェアを構成
- [Authorize]属性で保護されたエンドポイント

## 4. ドメインモデルの定義

フロントエンドの型定義（`types/index.ts`）に合わせて：

- User (username, password hash)
- FileMetadata (name, path, folderId, type, size, tags, createdAt)
- Folder (name, parentId)
- FileTag (name, color) ※MongoDBのTagクラスとの競合を避けるため`FileTag`と命名

## 5. リポジトリ層の実装

MongoDBの各コレクション（users, files, folders, tags）へのCRUD操作を実装

## 6. ファイルストレージサービス

- `upload-dir`フォルダへの物理ファイル保存
- ファイル取得APIエンドポイント（画像・PDFのストリーミング）
- 将来的なS3移行を考慮したインターフェース設計

## 7. APIコントローラーの実装

フロントエンドの`api.ts`に合わせて以下のエンドポイント：

- POST `/api/auth/login` - ログイン
- POST `/api/auth/logout` - ログアウト
- GET `/api/auth/user` - 現在のユーザー取得
- GET `/api/tags` - タグ一覧
- POST `/api/tags` - タグ作成
- PUT `/api/tags/{id}` - タグ更新
- DELETE `/api/tags/{id}` - タグ削除
- GET `/api/folders` - フォルダツリー取得
- POST `/api/folders` - フォルダ作成
- DELETE `/api/folders/{id}` - フォルダ削除
- GET `/api/files?folderId={id}` - ファイル一覧
- POST `/api/files/upload` - ファイルアップロード [FromForm]
- DELETE `/api/files/{id}` - ファイル削除
- PUT `/api/files/{id}/tags` - ファイルのタグ更新
- GET `/api/files/{id}/download` - ファイルダウンロード
- GET `/api/files/{id}/content` - ファイル内容取得（プレビュー用）

## 8. 初期データのセットアップ

アプリケーション起動時に：

- 初期ユーザー（username: admin, password: password）を作成
- ルートフォルダ（id: "root"）を作成

## 9. CORS設定

フロントエンド（Vite開発サーバー）からのアクセスを許可

## 10. フロントエンドapi.tsの更新

モック実装を実際のバックエンドAPIコール（fetch/axios）に置き換え、JWT認証ヘッダーを含める

## 主要な実装ファイル

- `Program.cs`: DI設定、認証/CORS/Swagger設定
- `Domain/Models/User.cs`, `FileMetadata.cs`, `Folder.cs`, `FileTag.cs`
- `Infrastructure/Repositories/*Repository.cs`
- `Infrastructure/Services/FileStorageService.cs`
- `Application/Services/*Service.cs`
- `Presentation/Controllers/*Controller.cs`
- `Presentation/DTOs/*Dto.cs`

### To-dos

- [ ] レイヤードアーキテクチャのフォルダ構造とドメインモデルを作成
- [ ] MongoDB接続設定とコンテキストクラスを実装
- [ ] JWT認証サービスとミドルウェアを実装
- [ ] インフラ層のリポジトリを実装（User, File, Folder, Tag）
- [ ] ファイルストレージサービス（upload-dir）を実装
- [ ] アプリケーション層のビジネスロジックサービスを実装
- [ ] REST APIコントローラーとDTOを実装
- [ ] Program.csでDI、CORS、認証を設定
- [ ] 初期データ（adminユーザー、ルートフォルダ）のセットアップを実装
- [ ] フロントエンドのapi.tsをバックエンドAPI呼び出しに更新