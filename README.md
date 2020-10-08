This tool was built for crawling data from a Vietnamese medical website. The data were used for training a Biomedical Text Classification model.

## 1. Installation:

- Requirement: node, yarn, mongo
- Install requirements: ``` yarn install ```

## 2. Demonstration:

- On the left hand side of the website, there are a lot of medical categories (which are the final label that model has to classify)
![List of categories](https://github.com/minhnq97/crawling-medical-data/blob/master/categories.PNG?raw=true)

- Each category has a lot of questions that are already labeled.
![Example of questions inside a category](https://github.com/minhnq97/crawling-medical-data/blob/master/inside_cate.PNG?raw=true)

- A detail question includes the title and the content of the question. The reply of doctors is ignored because it has no use in classification task.
![Detail of a question](https://github.com/minhnq97/crawling-medical-data/blob/master/question.PNG?raw=true)

## 3. Running:

**Note**: The stage 1 takes several time so **highly recommend** to reproduce the code by running from **stage 2**.

- **Stage 1**: (To run from stage 1 to the end: ```npm run start -- --stage 1```)

Crawl the URI of all questions and saved into folder *onetime*:

```
src
├── config.js
├── config_test.js
├── db
│   ...
├── index.js
├── lib
│   ...
└── onetime
    ├── crawl_cac_cau_hoi_benh.js
    └── *link_question.pt.json* <--- URI saved into this file
```
- **Stage 2**: (To run from stage 2 to the end: ```npm run start -- --stage 2```)

Crawl questions saved into the json in previous step and save them into MongoDB.

- **Stage 3**: (Run the last stage: ```npm run start -- --stage 3```)

Export data saved in DB to json files. Each file represent for a category.
```
local_data
└── crawl_md_question
    ├── c10.pt.json
    ├── c11.pt.json
    ├── c13.pt.json
    ├── c14.pt.json
    ├── c15.pt.json
    ├──...
    └── ls_cate.json
```

The json has a following format:

```
[
  {
    "_id": "5f43616d8f60cf559ab781a4",
    "status": 2,
    "question_link": "/hoi-dap/vien-nao-nhat-ban-c10-q6864#traloi",
    "created_at": "2020-08-24T06:42:53.022Z",
    "updated_at": "2020-08-24T08:55:37.872Z",
    "__v": 0,
    "c_id": "c10",
    "q_content": "Cho tôi hỏi: Bệnh viêm não Nhật Bản là gì? và Tại sao lại gọi là bệnh viêm não Nhật Bản?  ",
    "q_id": "q6864",
    "q_related": [
      {
        "text": "Cho",
        "href": "/hoi-dap/cho-c10-q55650"
      },
      {
        "text": "Tư vấnhiv",
        "href": "/hoi-dap/tu-vanhiv-c10-q55643"
      },
      {
        "text": "HIV",
        "href": "/hoi-dap/hiv-c10-q55611"
      },
      {
        "text": "HIV",
        "href": "/hoi-dap/hiv-c10-q55571"
      },
      {
        "text": "Lây nhiễm ",
        "href": "/hoi-dap/lay-nhiem--c10-q55557"
      }
    ],
    "q_title": "viên não Nhật Bản"
  },
  ...
]
```
