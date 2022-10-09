import pandas as pd
import networkx as nx
from clickhouse_driver import Client


ck_client=Client(host=host,
                 user=user,
                 password=password,
                 database=database,
                 send_receive_timeout=send_receive_timeout)

sql="""
select f.follower,p.to as owner
from polygon_lens_profile p 
left join polygon_lens_follow f 
on p.profileId=f.profileId
where p.to<>f.follower
group by f.follower,p.to
"""
ans=ck_client.execute(sql)

source_df = pd.DataFrame(ans)
lens_network=nx.from_pandas_edgelist(source_df,0,1,create_using=nx.DiGraph())
# print("address：" + str(len(lens_network.nodes)))
# print("follow：" + str(len(lens_network.edges)))

pr_dict = nx.pagerank(lens_network)
pr_df = pd.DataFrame.from_dict(pr_dict,orient="index")
pr_df = pr_df.reset_index(level=0)
pr_df.columns = ["address","pr_value"]

ck_client.execute("INSERT INTO polygon_lens_pagerank VALUES", pr_df.to_dict('records'))