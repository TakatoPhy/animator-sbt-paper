# 書誌・事実監査の記録（2026-09-12）

Ledger投稿の準備として、`references.bib` の全37件と本文の数値主張をDOI登録機関・出版社のCrossref寄託・発行元自身の文書に照合した。**このファイルは何が誤っていたかの記録。修正は同日のコミットで適用済み。**

背景: Ledgerの投稿チェックリストは「引用が実在し hallucinated でないこと」を著者に確認させ、AI方針は「spurious or dishonestly-cited bibliographic entries」を名指しで警戒対象にしている。

---

## A. 帰属が捏造されていたもの（5件）

| 旧キー | 誤っていた内容 | 正しい記録 |
|---|---|---|
| `almarri2025decentralized` → **`franklin2025decentralized`** | **著者もDOIも実在しない。** DOI `10.1016/j.jnca.2025.103876` はdoi.orgでもCrossrefでも404。JNCAに論文番号103876は**どの年にも存在しない**（誤記ではない） | Sam Prince Franklin S.; L. Mary Shamala; Thankaraja Raja Sree（全員Vellore Institute of Technology）, _JNCA_ **242**:104190, 2025-10（online 2025-06-10）, DOI `10.1016/j.jnca.2025.104190` |
| `zhang2025zkbar` → **`berriosmoya2025zkp`** | 論文は実在。**著者が捏造**（Zhangは1人も関与していない） | Juan Alamrio Berrios Moya（Auckland UT）; John Ayoade; Md Ashraf Uddin（Crown Institute）, _Sensors_ **25**(11):3450, 2025-05-30, DOI `10.3390/s25113450`。PubMed PMID 40968974 / PMC12158337 で独立確認。⚠️ 「zkBAR」という略称は記録に見当たらない＝旧キーの造語の可能性 |
| `did_survey2024` | arXiv IDは正しいが**著者が捏造**（Stockburgerは無関係） | Carlo Mazzocca; Abbas Acar; Selcuk Uluagac; Rebecca Montanari; Paolo Bellavista; Mauro Conti。査読版 _IEEE COMST_ **27**(6):3641–3671, 2025-12, DOI `10.1109/COMST.2025.3543197`（プレプリント arXiv:2402.02455） |
| `adler2020blood` → **`ristola2017blood`** | タイトルのみ実在。**著者・年・種別が全て誤り** | Jacqueline Ristola（当時York大MA、現Bristol大）, in _Symposium Proceedings: GLRC Graduate Student Symposium 2016_（eds. Thomas, House, March）, Global Labour Research Centre, York University, **pp.85–93, 2017年9月**, DOI `10.17613/M6481H`。DataCite APIで creator/年/種別(ConferenceProceeding)を確認。⚠️ 旧URLの "2020/06" はWordPressのアップロードフォルダであって年ではない |
| `nippon2024anime` → **`matsunaga2025labor`** | URLのみ正しい。**タイトル・著者・年が全て誤り**。旧タイトルはページのどこにも存在しない | "Labor Challenges in Japan's Anime Industry: In Search of Equity and Sustainability"、著者 **松永伸太朗**（一橋大学准教授）、**2025-10-30**（更新2026-01-23）。Nippon.comは著者ではなく発行元 |

## B. 捏造された編集者名・DOI（2件）

- **`sporny2022vc`**: 第6編集者「**Millican, Kyle」は実在しない**。W3C v1.1 勧告を直接検索して「Kyle Millican」は**0件**。正しくは **Kyle Den Hartog (MATTR)**。加えて `https://www.w3.org/TR/vc-data-model/` は現在**v2.0（2025-05-15勧告）を配信**しているので、v1.1は日付付きURL `https://www.w3.org/TR/2022/REC-vc-data-model-20220303/` で引く
- **`kakebayashi2023sbt`**: DOI `10.2139/ssrn.4449592` は**未登録**（doi.orgとCrossref APIで404、OpenAlex・Semantic Scholarにも記録なし）。文書自体は実在 ＝ **BGIN SR 008**、IAM/Key Management and Privacy (IKP) Working Group、2023年2月、104頁。DOIを削除しBGINのURLに変更

## C. 文書の性質を誤って記述していたもの（3件）

- **`nafca2024labor`** → **`nafca2024statement`** に改名。`https://nafca.jp/news20241226/` は**NAFCAの労働実態報告ではない**。「アニメ業界の労働等の実態について」という短い**見解表明**で、**日本動画協会（AJA）の報告書に対するコメント**。AJAの報告書 `aja2024labour` を別項目として追加した
- **`meti2025anime`**: 「業界の現状及びアクションプラン**（案）**について【アニメ】（**事務局資料**②）」＝ 第3回エンタメ・クリエイティブ産業政策研究会（2025-01-17）の**配布資料の草案**。確定した政府方針として引くと誤り
- **`jftc2025anime`**: 調査は**映画とアニメの両方**を対象。アニメ本体は3番目の構成PDF `251224_eigaanime3.pdf`

## D. その他の修正

- `buterin2022soulbound`: **URLが死んでいた**。`dig vitalik.ca A` が NOERROR かつAレコード0件。→ `https://vitalik.eth.limo/general/2022/01/26/soulbound.html`
- `nafca2024survey`: 団体英名が誤り。正しくは **Nippon Anime & Film Culture Association -NAFCA-**（NAFCA自身の英語ページより）。⚠️ URLスラグの "survey02" は誤警報 ── 実際に「第1回」報告書（survey01は生成AIに関する別調査）
- `janica2023survey`: 団体英名 "Japan Animation Creators Association" は**正しい**。URLをホームページからPDF直リンクへ。公表日 2023-12-07
- `sbt_health2024`: online-first 2024-07-03、**版record は2025年**（vol.4 no.3, pp.1–15）。volume/number/pages を補完
- `verma2025sbt_agriculture`: `and others` が第4著者 **Shivani Singh** を隠していた。`pages={290}` は論文番号
- `sbt_credentials_digital2024`: 全著者名を展開しアクセント復元（Pericàs, Payeras-Capellá）、`number={11--12}` 補完
- `sannon2022privacy`: **Sun, Bilun → Sun, Billie**（Crossref/OpenAlex/Semantic Scholar/ACM DLの4系統で一致）
- `goldston2023recovery`: **Chaffer, Tony J. → Tomer Jordi Chaffer**／**Osowska, Joanna → Justyna Osowska**／第4著者は Von Goins II, Charles A.
- `blockchain_creative2023`: 第2著者は印字上 **Yanhao "Max" Wei**
- `wef2017creative`: 著者名が欠落していた → **Takahashi, Ryo**（WEF Agenda記事は署名記事）
- `mordor2026anime`: タイトルがページに存在しない言い換えだった → "Anime Market Size & Share Analysis — Growth Trends and Forecast (2026–2031)"。⚠️ ベンダーの営業ページで無告知で書き換わる（footerに last updated 2026-09-11）ため、アクセス日とアーカイブの固定が必要
- `fourpillars2025anime`: **URLが308リダイレクト** → `https://research.4pillars.io/en/research/anime-needs-web3`。著者は**ハンドル "Ponyo"** で法的氏名は非公開（**捏造するな**）
- `animechain2024whitepaper`: フッタは全頁 **v1.1**（ファイル名はv1）。発行元は**2025-09-01にAniarkへ改称**、animechain.ai は corp.aniark.co へリダイレクト
- `daubenschuetz2022erc5192`: 第2著者「Anders」は**切り詰めではなく完全な公表名**（мononym, @0xanders）。BibTeXの姓名分割を防ぐため `{Anders}` と波括弧で囲った
- `gangwal2023layer2`: `pages={103539}` 補完
- DOI追加8件: `berriosmoya2025zkp` `did_survey2024` `benet2014ipfs` `goldston2023recovery` `condry2013soul` `ristola2017blood` `franklin2025decentralized`

**変更不要だったもの**: `buterin2022decentralized` `entriken2018erc721` `buterin2021erc4337` `okeda2011animators` `mori2011pitfall` `tschang2010outsourcing` `pinata2026pricing` `sbt_credential_framework2023`

---

## E. 本文の数値主張の監査

**数値そのものは全て正しかった。誤っていたのは参照先。** 捏造ではなく取り違え。

| 主張 | 数値 | 出典 | 措置 |
|---|---|---|---|
| 制作市場 3,621億円（2024） | ✅ TDB原文「3621億4200万円」前年比4.0%増で過去最高 | ✅ | ─ |
| 自営 47.3%（2023） | ✅ JAniCA 2023 **p.23**「18. アニメーション制作者の就業形態」(Q15a, n=425) フリーランス30.8+自営業16.5 | ✅ | ─ |
| **69.6%（2019）** | ✅ | ❌ **JAniCA 2019報告書 p.32「図4-2-1 就業形態」(n=382) フリーランス50.5+自営業19.1。2023版に「69.6」は1度も出てこない** | `janica2019survey` を新設し再指定 |
| **全国平均 7.6%** | ○ 総務省統計局 労働力調査（詳細集計）2022年平均: 自営業主514万人/就業者6,713万人 = 7.66% | ❌ **JAniCAのどちらの報告書にも無く、実質無出典だった** | `mic2023labourforce` を新設し再指定 |
| 労働時間 中央値225h/最大336h/全国162.3h | ✅ NAFCA survey02 原文「平均が219時間、中央値では225時間、さらに最大値は月間で336時間」「日本全体の平均月間労働時間162.3時間」 | ✅ | ─ |
| **月収20万円以下 37.7%** | ✅ NAFCA survey02 図6 | ❌ 12月の見解表明ページを引いていた | `nafca2024survey` に再指定 |
| **時給中央値1,111円／最低賃金1,004円** | ✅ NAFCA survey02 図11 原文「中央値でも1111円と、2024年3月現在の最低賃金の全国平均額1004円をやっと超えた数字」 | ❌ 同上 | `nafca2024survey` に再指定 |
| 動画263.2万円／原画399.8万円 | ✅ JAniCA 2023 **p.49**「42. 職種別年収・年齢・勤続年数」動画 n=27 平均263.2万円／原画 n=62 平均399.8万円 | ✅ | ─ |
| 世界市場 $49.6bn / CAGR 10.6% | ✅ Mordor（49.62→49.6、10.61→10.6の丸めのみ） | ✅ | ─ |
| JFTC 一方的な代金決定 | ✅ アニメ「ポイント」PDFが「協議に応じない一方的な代金決定」を取適法・独禁法に関わる行為として明示 | ✅ | 脚注で「映画＋アニメの合同調査」「2026-01から法名変更」を補足 |
| フリーランス法 2024年11月 | ✅ | ✅ | 「enacted」→「took effect」に修正（公布は2023-05-12、施行が2024-11-01） |
| ¥200/枚（Ristola） | 未検証 | ─ | 本文で既に「例示的」と自己開示済み。脚注の性質記述のみ修正 |

⚠️ **AJA報告書のPDFを全文検索した結果、37.7%・1,111円・1,004円は1件も含まれていない**（grep確認）。AJAに付け替えるのも誤りだった。

⚠️ **USD換算 $2.41 billion は TDB が述べていない。** 本稿独自の換算（約¥150.3/$ を含意）で、レート・日付が未記載。明示するか削除するか要判断。

---

## F. 再発防止

- 生成した書誌は**必ずDOI登録機関（Crossref/DataCite）または出版社の寄託に照合する**。著者名の照合を省略しない（今回の5件はいずれもタイトルは実在した）
- `and others` と姓＋イニシャルだけの著者欄は**危険信号**。展開できないなら実在を疑う
- 数値は「どの文書のどの頁か」まで書く。URLだけでは取り違えが検出できない
- ⚠️ 自動要約が**もっともらしい存在しない引用文**を生成した実例が2件あった（ICMJEの偽の引用文、NISOの偽の14項目リスト）。**verbatimを主張するなら原文をバイト単位で確認すること**
