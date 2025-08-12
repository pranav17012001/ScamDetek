import json
from sentence_transformers import SentenceTransformer
from config import PINECONE_API_KEY, PINECONE_ENV, PINECONE_INDEX_NAME, EMBEDDING_MODEL_NAME
from pinecone import Pinecone

model = SentenceTransformer(EMBEDDING_MODEL_NAME)

# 初始化 Pinecone 客户端
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX_NAME)
# if not pc.has_index(index_name):
#     pc.create_index(
#         name=index_name,
#         vector_type="dense",
#         dimension=1536,
#         metric="cosine",
#         spec=ServerlessSpec(
#             cloud="aws",
#             region="us-east-1"
#         ),
#         deletion_protection="disabled",
#         tags={
#             "environment": "development"
#         }
#     )

def load_and_upload(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            doc = json.loads(line)
            vector = model.encode(doc['content']).tolist()
            index.upsert([{
                "id": doc["id"],
                "values": vector,
                "metadata": {
                    "title": doc["title"],
                    "content": doc["content"]
                }
            }])
    print(f"✅ 成功上传：{file_path}")

# if __name__ == "__main__":
    # load_and_upload(r"..\scam_knowledge\Audience-specific.jsonl")
    # load_and_upload(r"..\scam_knowledge\Cybersecurity.jsonl")
    # load_and_upload(r"..\scam_knowledge\Emerging Trends.jsonl")
    # load_and_upload(r"..\scam_knowledge\Legal & Reporting.jsonl")
    # load_and_upload(r"..\scam_knowledge\Scam Types.jsonl")
    # load_and_upload(r"..\scam_knowledge\scam_knowledge1.jsonl")
    # load_and_upload(r"..\scam_knowledge\User Safety.jsonl")
    # load_and_upload(r"F:\2025s1\FIT5120\ScamDetek\backend\scam_knowledge\scam_report.jsonl")
    # load_and_upload(r"F:\2025s1\FIT5120\ScamDetek\backend\scam_knowledge\scam_detection_ways.jsonl")