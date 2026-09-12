# Ledger（投稿先）の実証分析

出典: ledgerjournal.org の全11巻（2016 Vol.1 – 2026 Vol.11）。目次89件・本文PDF 89件・公開査読記録75件を全数取得して抽出。編集後記等13件を除いた**研究論文76本**が母集団。調査日 2026-09-12。

## 投稿規定（確認済み）

- **専用クラスファイル必須**（`ledger.cls` / `ledgerbib.bst`）。提出はPDF。**pdflatex推奨**
- **カバーレター必須**。「何が新規か」「誌のスコープにどう合うか」を述べ、**推薦査読者を3名**挙げる
- 引用は「実在すること・hallucinated でないこと」を著者が確認。**doi.org リンク優先**
- **AI使用の申告必須**。未申告・不適切使用を疑えば却下・撤回する権利を留保。名指しの警戒対象＝「**over-reliance on point-form structuring**」「**spurious or dishonestly-cited bibliographic entries**」
- **APC $1,500**（機関資金のある著者）。**資金の裏付けが無い著者は自動免除**。⚠️ TOONIQが機関資金に当たるかは未確認、投稿前に編集部照会
- ライセンス CC BY 4.0。プレプリント（arXiv/SSRN/Crypto ePrint）掲載済みの投稿を明示的に受理
- **リポジトリ公開は採択の条件**:「論文の主張を評価するのに必要な材料（生データ、ソースコード等）をすべて読者に自由利用可能にすることに同意する」
- 目標turnaround 10〜12週／ラウンド。ラウンド数の上限なし
- 最終PDFのハッシュを**Bitcoin署名することが強く推奨**されている

## ⚠️ 実質の審査はカバーレター（最重要）

Focus and Scope の原文:

> "Submissions detailing technical advancements should focus on scholarly analysis and demonstrate a **broader relevance than to a single application**... whether the scope of the paper is broad enough for Ledger's readership will be determined based on the **prevalence of the problem** it aims to solve and the **novelty and broader relevance of the solution's approach**. **Authors submitting such papers are advised to make a case addressing these criteria in their cover letter.**"

**査読記録75本の中に門前払いの記録は1件も無い。** スコープで落ちる論文は査読に到達しない＝編集者がカバーレターを読んだ段階で決まる。**本稿の唯一の実質的リスクはここ。**

## 掲載論文の構成比（68本、ロボティクス増刊を除く）

| 種別 | 比率 |
|---|---|
| 経済・金融（モデル/ゲーム理論/市場/評価） | 約28% |
| 理論・暗号・プロトコル設計 | 約24% |
| 実証・データ分析 | 約22% |
| 法・政策・社会科学・ガバナンス | 約9% |
| **システム・実装** | **約9%** |
| **単一産業の応用ケーススタディ** | **約7%** |

システム/応用は年1本、多い年で2本。

## 直接の前例（近い順）

1. **Barter Machine** — Can Ozturan, Vol.5 (2020)。**最も近い**。単著、Solidityコントラクト、Ropstenデプロイ、Web UI、**ガス実測をUSD換算した表**、ソルバーのベンチマーク。機関パートナーなし、実ユーザーなし
2. **Are Smart Contracts and Blockchains Suitable for Decentralized Railway Control?** — Kuperberg, Kindler, Jeschke（Deutsche Bahn / DB Systel）, Vol.5 (2020)。単一産業の応用プロトタイプ。**査読者5名、うち2名が reject 勧告、2名が Bottom 50% → 掲載**
3. **Non-Fungible Programs** — Regalia & Adams, Vol.10 (2025)。NFTベースのシステム、GitHubモノレポ、**デモを1本作って評価しただけで minor revision 採択**。最新のシステム論文
4. **Enhancing Electronic Voting With A Dual-Blockchain Architecture** — Leune & Punjwani, Vol.6 (2021)。プロトタイプ＋独自合意アルゴリズム＋公開リポジトリ
5. **HLF-Kubed** — Tzenetopoulos et al., Vol.7 (2022)。Hyperledger Fabric を3台のRaspberry Pi級デバイスで実験評価
6. **A Decentralized Identity-Based Blockchain Solution...** — Kang & Lemieux, Vol.6 (2021)。SSI＋機密計算＋利用制御
7. **From Smileys to Smileycoins** — Stefansson & Lentin, Vol.2 (2017)。**全76本で唯一、実ユーザー（学生数千名）のいる実応用**

## ⚠️ SBTの前例はゼロ

**soulbound / soul-bound / ERC-5192 / SBT は76本の本文にも75本の査読記録にも1度も登場しない。** ERC-721 は11本で言及（ほぼ全て通りすがり）。比較される前例が無い代わりに、なぜこの原始要素が重要かの立証責任は全部こちらにある。

## 査読の実態

### フォームの設問（verbatim）
- "Does this paper represent a novel contribution to cryptocurrency or blockchain scholarship?"
- "**If you answered 'yes'... in one sentence, describe in your own words the novel contribution made by this paper:**" ← **ここで新規性の判定が決まる。1文で答えられるように書け**
- "Is the research framed within its scholarly context and does the paper cite appropriate prior works?"（選択肢に "Important references are missing"）
- "Please assess the article's level of academic rigor"（Excellent / Good / Unsatisfactory / Poor）
- "Please assess the article's quality of presentation"
- "How does the quality of this paper compare to other papers in this field?"（Top 5% 〜 Bottom 50%）

### 過程
- ラウンド数: 1回が約47本、2回が約23本、3〜4回が5本
- 査読者数: 2名が最頻（46本）、3名18本、4名4本、5名2本、6名1本
- 評価分布: Good 133 / Unsatisfactory 58 / Excellent 61。Top 50% 24 / Top 20% 20 / Bottom 50% 18 / Top 10% 14 / Top 5% 11
- novelty: Yes 48 / No 10 / Not sure 17

### ⚠️ 最重要の発見: 否定的評価でも通る
- **novelty に "No" が付いた論文が6本、Bottom 50% 評価が8本、明示的な reject 勧告が5本、いずれも掲載されている**
- Vol.4 のシミュレーション論文の記録: 査読者A「Given these weaknesses and the limited insights offered up by the paper, I recommend its rejection.」→ 編集判断で掲載
- **編集部は novelty の門番ではなく集約役・裁定役**

## 頻出の指摘（対策必須）

### 1. 「なぜブロックチェーンなのか」（約24本。実装論文に対する決定的批判）
HLF-Kubed 査読者A:
> "Resource monitoring is not the type of data where tamper-proofness, trustworthiness and other DLT core properties are of highest importance. What is the advantage of DLT-based monitoring compared to, for example, MoM-based data collection?"

電子投票 査読者B:
> "Many of these systems meet the specific audit requirements that your paper specifies without using a blockchain, so the paper needs to clarify what makes the blockchain different/better"

**✅ 全事例で、著者は散文の論証と将来課題への先送りだけで要求を満たしている。非ブロックチェーン方式の実ベンチマークを走らせた者は1人もいない。** ただし**論証は本文に置くこと**（カバーレターだけに書いたら本文に移せと言われた事例あり）。

→ 本稿は §4 に「なぜVC/EAS/署名ログでないか」を既に持っている。**強み**。

### 2. 「既存部品の合成にすぎない」（明示的攻撃7本）
電子投票 査読者B:
> "The use of 2 blockchains ... is not particularly novel and the separation of the 2 by a ballot claim ticket is a fairly standard approach."

同 査読者C（脱出路を示している）:
> "It seems the real contribution here compared to other papers in the literature is the consensus algorithm. ... I don't feel the individual transaction details constitute enough adequate original material for a paper. **However, the consensus algorithm might.**"

**✅ 生き延びた合成型論文は全て「どの部分要素が delta か」を名指しして主張を狭めた。** Barter Machine は査読者の提案を受けて改題:
> "why not 'A prototype implementation of a smart-contract-based system for the bartering of ERC20 tokens'..."
→ 著者はタイトルを変更、採択。

### 3. 評価の厳密さ ── ただし実ユーザーは要求されない
**11巻を通じて、本番運用・実ユーザーを採択条件にした査読者は1人もいない。**
- 電子投票: "Unfortunately, field-testing in a life environment is out-of-scope for this phase of the research." → 採択
- HLF-Kubed: 3台を超える評価を拒否「feasibility proofness が目的」 → 採択
- Tokenized Carbon Credits: 取引量データの提供を2度拒否 → 採択
- Non-Fungible Programs: **デモを1本作ってスクリーンショットを見せただけ**。脅威モデルもユーザー調査も要求なし

査読者が実際に強制したのは**内部整合性**（要求からテストシナリオへの追跡可能性、擬似コードと図の正しさ、第三者システムに関する記述の正確さ）。

反例: Smileycoins は実ユーザー数千名がいたのに Bottom 50%。理由は「統計的検定で裏付けられていない」＝**配備は推論の代わりにならない**。

### 4. 関連研究（**この誌で最頻の具体的指摘**）
**"Important references are missing" が75本中28本で選択されている。** 求められているのは表よりも**叙述的な state of the art とアーキテクチャの導出**:
> "The reader is not able to gain the overview and insight from the paper. No overview of alternative architectures, nor a genesis or derivation of the chosen architecture is given."

ただし比較表は安価に効く（B2B会計論文は表4つを追加して1ラウンドで採択）。

### 5. 混成読者への可読性
読者は経済学者・法律家・計算機科学者が同居。査読者がこれを取り締まる:
> "The paper is not self-contained. The paper should be understandable even for readers who are not familiar with cryptocurrency."
> "To understand the value of the paper the reader needs already to have ... a deep technical understanding ... This is a small circle of people only, and definitely a much too small fraction of the readers of the Ledger Journal."

司法文書の論文は法律読者向けに gas / salt / DAG の語釈を求められた。

### 6. 一般化可能性は意外に指摘されない
真正の「狭すぎる」批判は約3本のみ。**スコープの門は査読ではなく編集段階**（上記）。

### 7. 拒否は機能する
5本以上の記録で、著者が査読者の要求を**理由を述べて**拒否し、編集部が受け入れている。

## 形式の実測値

| 項目 | 中央値 | 平均 | 範囲 |
|---|---|---|---|
| 頁数 | **16.5** | 17.6 | 6–39 |
| 語数（PDF抽出、ヘッダ含む） | **約7,400** | 約7,700 | 2,026–20,251 |
| 番号付き節 | **5** | 5.1 | 1–12 |
| 図 | **4** | 4.4 | 最大20 |
| 表 | **1–2** | 1.9 | 最大7 |
| 文献（Notes and References） | **30–38** | 約37 | 8–148 |

76本中52本が4,000–10,000語の帯に収まる。

- **「Related Work」を番号付きの上位節にしているのは76本中12本のみ**。多くは序論か背景節に畳み込まれている
- **Solidityのソース掲載はゼロ**。Barter Machine すら本文にも付録にもコードを載せていない。代わりに「コントラクト関数の表」＋27行の数学的擬似コード＋記号表
- 「Algorithm N」の擬似コードブロックを持つのは全体で9本のみ
- 付録は76本中26本。中身は証明と導出であってコードではない
- 著者自身のリポジトリへのリンクは数本のみ（199, 406, 402, 425 等）
- 図の可読性は**この誌で最も繰り返される体裁上の苦情**。鉄道論文は2度「図が非常に読みにくい」と言われた

### ガス実測の作法（11巻で2本のみ）
Barter Machine の提示が雛形:
- **Fig.4**: 注文サイズに対するガスとUSDコストの二軸プロット
- **Table 3**: 生のガス整数（1,971,238 … 34,522,770）とUSD（$0.48–$9.18）を併記。ガス上限を超える行に `*` を付し脚注「∗ exceeds gas limit 8M on Ethereum Mainnet, Ropsten network and the private development node」
- USD換算は**日付と2つの定数を明記**（2 Gwei、$133/ETH、2019-03-14）
- 測定環境は**MacBook Pro上のローカルParity開発チェーン**。査読者は環境も価格設定も問題にしなかった

**ガス分散分析・価格感度分析・mainnet実測の前例はこの誌に無く、要求されたこともない。**

## 本稿への含意（記録が示す必須の変更）

1. **カバーレターをスコープ条項に直接答える形で書く。** 「アニメーターにクレジット記録が必要」ではなく「不透明な多者間制作パイプラインにおける個人貢献の、非移転かつ検証可能な証明」。同型の領域（VFX、建築、ソフトウェア受託、学術著者性）を2〜3挙げる。**門前払いと査読到達の分かれ目**
2. **タイトルと要旨を単一業種から離す。** 機構と一般問題を前に出し、アニメは評価ドメインに降格。鉄道論文がタイトルに業種を残して生き延びたのは、製品の宣言ではなく**問い**の形（"Are ... Suitable for ...?"）だから
3. **「なぜブロックチェーンか」を序論で先回りして答える。** 散文で十分。ただし本文に置く
4. **delta を1文で、システム全体より狭く名指す。** ERC-721+5192 の合成を新規性として主張しない
5. **関連研究に予算を割き、それでも不足と言われる前提を置く。** ブロックチェーン資格証明／W3C DID・VC／SBT文献／**非ブロックチェーンの資格証明文献**を網羅。比較表は安価に効く
6. **本文からコードを削る。** 関数一覧の表＋非自明な論理の擬似コード1〜2本＋リポジトリリンク。リポジトリ公開は採択条件でもある
7. **ガスは Barter Machine 方式で提示。** 関数ごとの生ガス＋日付とガス価格と通貨価格を明記したUSD換算。加えて**測定環境（どのtestnet、コンパイラ版、optimizer設定）を正直に書き、ガス価格の感度を一言**。誰も要求しないが半頁で厳密性の上積みになる
8. **誰も強制しないセキュリティ節を自分から書く。** 想定攻撃面＝共謀した自己証明／発行者ロールのスタジオによる掌握／非移転トークンでの鍵紛失／公開貢献グラフからのプライバシー漏洩
9. **経済学者と法律家に向けて書く。** soulbound / 非移転性 / gas / testnet に語釈を付ける
10. **目標: 16–20頁、約8,000語、5–7節、図4–6、表2–4、DOI付き文献30–45**
11. **推薦査読者3名は、アニメではなく検証可能資格証明・アイデンティティの研究者から選ぶ**
12. **2ラウンドを見込み、敵対的な初回査読に動じない。** 1名が敵対・1名が好意的という分裂は応用論文の常態

## 総合判定

評価の厳密さと成果物の質では**中央値を上回って到達する**（ガス実測論文が11巻で2本しかない中、60本のテストスイート＋実測ガスを持っている）。新規性は踏み固められた生存可能圏。**唯一の実質的な弱点はスコープで、査読者ではなく編集者がカバーレターを読んで裁定する。** そこに不均衡なほど労力を割けば現実的な投稿先。
