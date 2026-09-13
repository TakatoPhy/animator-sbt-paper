# 文献アップデート（2026年4月以降）

調査日 2026-09-12。本稿は2026年3月にSSRN掲載なので、関連研究は2026年初頭で止まっている。以下は Crossref / arXiv API / OpenAlex / EUR-Lex / W3C の `/TR/` ステータス行 / GitHub release API など**機械可読な出版元で検証済み**のもののみ。開けなかったものは明示する。

## ✅ 競合は現れていない

**SBTでアニメーターの貢献を証明する研究は他に無い。** Crossrefのタイトル走査＋OpenAlex全文＋arXivが同じ7〜8本に収束するので、2026年のSBTコーパスはほぼ網羅できている。中核の主張は生きている。

脅威は**文脈的**（EUがブロックチェーン抜きの解を出荷した）と**修辞的**（査読者が「なぜCRediT/C2PA/ERC-7634でないのか」と聞ける）。

---

## ⚠️ 最優先: 前提を攻撃する論文

### Liquefaction（範囲外だが最大の欠落）
**Austgen, Fábrega, Kelkar, Vilardell, Allen, Babel, Yu, Juels, "Liquefaction: Privately Liquefying Blockchain Assets," _2025 IEEE S&P_, pp.1493–1511. DOI 10.1109/SP61157.2025.00156**

TEEによる鍵の encumbrance で、**単一のエンドユーザーアドレスを貸与・共有・プール可能にする**。しかも**SBTを名指しで「破る対象」に挙げている**。オンチェーンに痕跡を残さない。

> **「soul アドレス＝1人の人間」という本稿の土台を直接崩す。bibにおける最も目立つ欠落。段落を割いて対処せよ。**

### ChainCred ── cherry-picking 問題
**Song, Xiao, Liu, Yang, "ChainCred: Enforcing Comprehensive Credential Disclosure in WEB3 Systems," _IEEE ICDCS 2026_, pp.1070–1080. DOI 10.1109/2575-8411.2026.00106**

保有者が有利な資格だけ提示し不利なものを隠すので、検証者はプロフィールが完全か判断できない。発行者ドメインごとに**強制開示**（最新の資格を提示するか、存在しないことを証明する）＋ZK選択的開示。

> アニメーターは失敗した作品のSBTを提示しなければよい。**「SBTで採用時の信頼が解決する」という無条件の主張を崩す。** 引用して対処しないと査読者に突かれる。

### ERC-7634 ── 設計判断そのものの競合
**Wang, Qi, Yu, Chen, "Counted NFT Transfers," arXiv:2602.19199v2**（v1 2026-02-22, v2 2026-05-25）。**ERC-7634 "Limited Transfer Count NFT" は eips.ethereum.org で Final**（著者 Qin Wang, Saber Yu, Shiping Chen、2024-02-22作成）。

ERC-721（無制限）と SBT/ERC-5192（禁止）の二項対立に対し**回数上限付き移転**を提案。**「なぜ永久非移転で、上限付き移転予算ではないのか」に答えられる必要がある。**

### 暗号的非移転性 ── ERC-5192が自然な選択という前提を崩す
- **Kretzler & Li, "No Honor Among Crooks: Non-Transferable Anonymous Tokens from Betrayability," _IEEE S&P 2026_, pp.1078–1097. DOI 10.1109/SP63933.2026.00050**
- **Shen, Ning, Feng, He, Huang, "Non-Transferable Anonymous Tokens With Decentralized Issuance by Blind Multisignatures," _IEEE TIFS_ 2026, pp.1593–1605. DOI 10.1109/TIFS.2026.3655949**

両者ともトークン規格も台帳も使わず**暗号的に**非移転性を達成。最低でも一文で代替設計点として言及すべき。

---

## 2026年のSBT文献

- **⭐ Lyu, Lou, Huang, Xia, Cui, "A Secure Self-Sovereign Identity Scheme Based on Soulbound Token and Trusted Personal Data Space," _IEEE TDSC_ 23(4):7644–7658, 2026-07. DOI 10.1109/TDSC.2026.3674806** ── 2026年で最も格の高いSBT論文。生体由来のIDにSBTを束ね、サービスごとの子IDで検証者間の名寄せを防ぐ。**本稿は全スタジオに単一の永続アドレスを使うので、この論文が解いたリンカビリティ問題がそのまま弱点**。TDSC級の査読者は「なぜ引いていない」と聞く
- **Nakayiza, Ahakonye, Kim, Lee, "PureTrust: A Soulbound Token-Based Blockchain Framework for Incentive-Driven Trust Management in V2X Networks," _IEEE IoT Journal_ 13(7):13734–13752, 2026-04-01. DOI 10.1109/JIOT.2026.3656576** ── **SBT＋IPFS＋発行者による失効**という、2026年で本稿に最も近いアーキテクチャ（ドメインは別）。動機も "reputation laundering"
  - 続編: 同チーム "Unlinkable Soulbound Trust Management Continuity in V2X Networks via Zero-Knowledge Reblinding," _IEEE VNC 2026_, pp.1–8. DOI 10.1109/VNC69225.2026.11629134
- **Makridis, "Verified pseudonymity as governance technology," _Journal of Institutional Economics_ vol.22, 2026-07-14. DOI 10.1017/S1744137426100587** ── 制度経済学によるDID/VC/人格証明/非移転的地位資格の扱い。**査読済みの経済学的論拠**で動機を補強でき、認証と公開身元の分離も扱う（スタジオの支払額を晒さずに検証可能なクレジットを得たいアニメーターに使える）
- **Kasimatis, Politis, Pitropakis, Papadopoulos, Buchanan, "Decentralized Device Identity: PUF-Driven Soulbound Token Verification for IoT Supply Chain Security," _IEEE Trans. Consumer Electronics_ 72(1):332–341, 2026-02. DOI 10.1109/TCE.2025.3642921** ── 応用カタログの拡張（医療/農業/学術→デバイス）。1行の広がり用
- **Frutuoso, Rodrigues, Francisco, Vaz, "Identity-Bound Academic Credentials on Blockchain: On-Chain Issuer Accreditation with ERC-3643 and OnchainID," arXiv:2607.16383v1, 2026-07-17**（査読前）── 本稿と**同じ穴**を扱う: ハッシュ固定だけでID束縛が無い、発行者認定の機構が無い、訂正/失効の経路が無い。**誰がスタジオを正当な発行者として認定するのかは本稿でも未解決のガバナンス問題**
- **Jiao & Udomlertsakul, "SuperPaymaster," arXiv:2605.05774v2, 2026-05** ── ERC-4337 paymaster の有効性を**オンチェーンのSBT状態**に紐付け、**Optimism Mainnetで実測**（n=50）。ガスレス導線の2026年の最先端であり、かつ**稀なmainnet SBT実装**＝testnet止まりの本稿に両刃
- **Pericàs-Gornals, Payeras-Capellà, Garcia-Font, Mut-Puigserver, Núñez-Gómez, "Fair and Direct Exchange of Non-Fungible Tokens: The ExNFT Approach," _ACM TOIT_, 2026-04-23. DOI 10.1145/3799703** ── 既に引いているUIBグループの2026年続編。関連性は中程度だが、最新作を引けば追随していることを示せる

⚠️ **引くな**: Sumarhadi, Sunardi, Riadi (JORESD, DOI 10.66314/joresd.v4i1.1230) ── DOIは解決しCrossref記録も実在するが**誌名がトピックと激しく不一致**、記事ページは403。実在はするが引かない方がいい。

---

## クリエイティブ産業 2026

- **⭐ Hosseini, Kerridge, Allen, Kiermer, Holmes, "Enhancing, Understanding and Adoption of the Contributor Roles Taxonomy (CRediT)," _Learned Publishing_ 39(2):e2048, 2026-03-19. DOI 10.1002/leap.2048** ── **存在する中で最強の非ブロックチェーン対抗枠組み**。学術出版は分類法＋中央レジストリ（CrossrefがCRediTメタデータを保持）で、**台帳なしに**貢献者の役割別帰属を解決した。査読者は「なぜアニメはCRediT式レジストリでなくトークンなのか」と聞く。同時に、役割単位の貢献メタデータが標準化に値する実在のインフラ問題であることの裏付けにもなる
- **⭐ O'Sullivan, "Blockchain for the Arts and Humanities," _Future Humanities_ 4(1):e70020. DOI 10.1002/fhu2.70020** ⚠️ Crossrefは**online-first 2025-12-17**、2026年vol.4(1)号に割当。その但し書き付きで引く ── Malik et al. 2023 の自然な更新版。**懐疑的**（中央集権的代替より優れているのかを明示的に問う）ので、列挙ではなく議論せよ
- **⭐ Golaszewski, Krawetz, Sherman, Zieglar, Matukumalli, Yus, Kegley, Barthel, Bowman, Barot, Kullman, "Verifying Provenance of Digital Media: Why the C2PA Specifications Fall Short," arXiv:2604.24890, 2026-04-27** ── C2PAの初の包括的な独立セキュリティ分析（形式手法含む）。仕様は「主張するセキュリティ目標を達成しておらず」高リスク用途に依拠すべきでないと結論。**「C2PAで既に出来る」への防御**
- **Trattner, Forstner, Starke, Knudsen, "C2PA Provenance Labels Increase Trust in Digital News Platforms Across Western Countries," _ICWSM_ 20(1):2267–2279, 2026-05-25. DOI 10.1609/ICWSM.v20i1.42749** ── N=6,114（US/UK/ノルウェー）。来歴ラベルが透明性・信頼性・出典信頼を有意に上げる。**可視の証明が行動を変える最良の実証**
- **Luo & Zheng, "Token Incentive and Blockchain Developer Contribution," _Information Systems Research_, 2026-04-06. DOI 10.1287/isre.2023.0480** ── トップIS誌。**トークン誘因だけでは貢献の量も独創性も持続しない**、所有集中と分散不足で悪化。「貢献をトークン化すれば結果が改善する」という主張を抑制する。ただし失敗モードは投機的に取引可能なトークンであり、**ERC-5192は構造的にそれを除去している** ── これは綺麗な反論として明示的に書く価値がある

**二次的（検証済み）**: Yang & Kim, _Applied Sciences_ 16(7):3391, DOI 10.3390/app16073391（オン/オフチェーン分割の先例）／Blount, Dvouletý, Mangarella, _J. Contemporary Business Research_, DOI 10.1177/3049513X261460110（チェコ美術市場N=35、NFT採用は依然低調＝限界の節に）／Kuzmich, John-Mariadoss, Anand, _J. Retailing_ 102(2):546–565, DOI 10.1016/j.jretai.2025.12.001／Martínez Luna et al., _Laws_ 15(2):32, DOI 10.3390/laws15020032（**トークン所有≠権利移転** ── SBTは労働を証明するのであって著作権ではない、という区別を本稿は明記すべき）

**業界（出典で確認）**: C2PA Content Credentials 2.4 は実在（spec.c2pa.org の2.4索引を確認）。ISO 22144 として ISO/TC 171/SC 2 で**委員会草案段階、未発行** ── 「ISO/IEC 22144として批准された」というブログの主張は**誤り**。2026-07-10にIFPI/RIAA/A2IM/WIN/IMPALA/Grammys/SAG-AFTRA/Human Artistry Campaign が "AI-Generated"/"AI-Assisted" の任意ラベルを発表（ifpi.orgで確認）── ただし**機械の関与の開示であって人間のクレジットではない**ので、本稿のギャップ論法を補強する

**⭐ 有用な否定的発見（各々一次で確認）**: **Credits Due** キャンペーンのサイトは2025年も2026年も更新なし（最新は2023年9月）／**DDEX** は2025・2026年に新規格を出していない（旧版の停止のみ）／**IGDA Game Crediting Guidelines は10.1（2023年3月）のまま**。**任意ベースのメタデータ運動は停滞している ── 直接引ける。**

---

## 標準・規制 2026 ── ここが最大の圧力

**EUが本稿と全く同じ用途に対して、ブロックチェーン抜きの解を法制化し、期限が3ヶ月以内に来る。**

- **Regulation (EU) 2024/1183（欧州デジタルID枠組み）** `https://eur-lex.europa.eu/eli/reg/2024/1183/oj` ── **Annex VI「属性の最小リスト」第8項が "Professional qualifications, titles and licences"**。EUは職業資格をウォレットの一級属性として法定した
- **ウォレット提供期限 2026年12月24日** ── CIR (EU) 2025/848 第11条に "It shall apply from the 24 December 2026." と明記
- 2026年の実施法（各々EUR-Lexで確認）:
  - **CIR (EU) 2026/798**（2026-04-07）遠隔オンボーディング
  - **CIR (EU) 2026/1731**（2026-07-15）適用規格の改正。Recital (1) verbatim: "as the W3C VCDM format is used as the reference format for attestations **in particular in the educational sector**, the European Digital Identity Wallets should also support this format..."
  - **CIR (EU) 2026/1735**（2026-07-15）QEAA/PuB-EAA 法の改正
  - 附属書は **SD-JWT VC / ISO mdoc / OpenID4VCI / OpenID4VP / ISO 18013-5・7 / IETF Token Status List** を義務付け。**失効は署名付きステータスリストであってオンチェーン状態ではない** ← 関連研究に必要な一文
- **EUDI Wallet ARF v3.0.0**（2026-07-23、GitHub release APIで確認）── §2.6.6.2 が **"Educational attestations and professional qualifications"**、関係者に企業と雇用主を挙げる。§5.2 は資格の性質が**発行者の法的地位**で決まるとする ＝ **EUは信頼を発行者の法的地位に置き、台帳の不変性には置かない。本稿の設計と最も鋭い対比**
- **⭐ Directive (EU) 2024/2831（プラットフォーム労働）** `https://eur-lex.europa.eu/eli/dir/2024/2831/oj/eng` ── **第9条6項がプラットフォーム労働者に、評価やレビューを含む就労生成データのポータビリティの権利**を付与、無償のツールと第三者への直接送信も。**国内法化期限は第29条1項で2026年12月2日**。**動機付けの最強の法的フック**（本稿のSBTが届けようとしているものが、3ヶ月以内に各国法になる）
- **W3C ── 年に注意、2026ではなく2025**: **VC Data Model 2.0 は2025-05-15にRecommendation**（w3.org/TR/vc-data-model-2.0/ のステータス行で確認）。**本稿は v1.1 と DID Core v1.0 を引いており両方とも旧版** → bib修正済み。2026年の動き: VCDM 2.1 FPWD（2026-04-09）、**DID 1.1 は Candidate Recommendation Snapshot（2026-03-05）にすぎない ── 標準として引くな**
- **IEEE 1484.2-2024「Learning and Employment Record (LER) Ecosystems」**（2024-05-20承認）── 範囲外だが**本稿の仕組みに最も近い既存標準**であり、位置づけを示すべき相手
- **OpenID4VCI 1.0 は2025-09-16 Final、OpenID4VP 1.0 は2025-07-10**。**SD-JWT VC はまだ Internet-Draft**（draft-ietf-oauth-sd-jwt-vc-19, 2026-08-31）── RFCではない

**日本（動機付け用）**: JFTCがフリーランス法第2章の運用状況報告を**2026-06-10**公表 `https://www.jftc.go.jp/houdou/pressrelease/2026/jun/260610_FL.html`（違反申告604件、新規1,626件、措置1,552件、回復1,734万円、相談4,351件＋ホットライン13,400件、支払遅延41.6%・条件明示不備41.3%、アニメ別内訳なし）。解釈ガイドラインは**2026-01-01**改正。⚠️ METIのエンタメ・クリエイティブ産業アニメ委員会資料（2026-01-30、`meti.go.jp/shingikai/mono_info_service/entertainment_creative/pdf/011_04_00.pdf`）はbot対策でHTTP 202・0バイト ── **手動でダウンロードすること**。日本側の最良の一次資料になりうる

---

## SBT資格証明は実際に配備されているか

**2026年の調査・測定研究は存在しない。** Crossref/OpenAlex/arXivでオンチェーン資格発行の実証・測定研究を探して0件。**この不在自体が報告可能。**

代わりに引けるもの:
- **⭐ Breckenridge, Vilardell, Leung, Austgen, Fábrega, Koushanfar, Juels, "πCreds: Privately Inferred Credentials," arXiv:2606.03771, 2026-06-02** ── 冒頭 verbatim: **"Decentralized verifiable credential systems have seen limited deployment in practice."** Juelsのグループなので重みがある。**testnet止まりのプロトタイプを弱点ではなく正常と位置づけられる最も綺麗な引用**
- 補強: Blount et al. 2026（NFT採用低調）／Luo & Zheng 2026（トークン誘因だけでは持続しない）

---

## 範囲外だが欠落として重い（2026年4月より前）

- **Liquefaction**（上記）── 最大の欠落
- **Xu, Namazi, Jalapally, Zafar, Yoo, Ayday, "Privacy-Preserving AI-Enabled Decentralized Learning and Employment Records System," _IEEE TPS-ISA 2025_, pp.293–303, 2025-11-12. DOI 10.1109/TPS-ISA67132.2025.00038**（arXiv:2601.02720）── TEEベースの学習・就労記録システムで、**作業の証拠から導出される自己発行の技能資格**。本稿の問題設定に最も近い既発表研究。引いていないと文献の穴に見える
- **IEEE 1484.2-2024**（上記）

---

## 検証できなかったもの（使う前に確認）
- ISO 22144 のステージコード（iso.org が全試行で403）
- AJAの2026-06-18改訂 自主行動計画（検索スニペットのみ）
- 2024年アニメ市場3.84兆円（スニペットのみ ── ただし別途AJA発表ページで確認済み、`credit_institutions.md` 参照）
- DDEXのAI開示標準に関する主張（DDEX自身の情報と矛盾）
- プラットフォーム労働指令のオランダ以外の国内法化（二次ブログのみ）
- 1EdTech Open Badges 3.0 / CLR 2.0 の日付
- **"Blockchain for Freelance Workforce Management in the Gig Economy," ICASS 2026, DOI 10.1109/ICASS69550.2026.11547702** ── Crossrefメタデータは検証済みだが抄録が取得できず低層の会場。トピックは「ブロックチェーン×フリーランス」で最も近い。**PDFを読んでから判断**

## 5本だけ足すなら
1. **Liquefaction**（10.1109/SP61157.2025.00156）── 前提への最強の攻撃、不在が目立つ
2. **Hosseini et al. CRediT**（10.1002/leap.2048）── 非ブロックチェーンの対抗
3. **Lyu et al. TDSC**（10.1109/TDSC.2026.3674806）── 2026年のSBT最先端
4. **O'Sullivan**（10.1002/fhu2.70020）── クリエイティブ産業サーベイの更新
5. **EU枠**（Reg 2024/1183 Annex VI 第8項 ＋ Dir 2024/2831 第9条6項）── 2026年の査読者は必ず聞く

testnet止まりを正当化する一文が欲しければ **πCreds**（arXiv:2606.03771）を追加。
