from email import header
from flask import Flask, render_template, request, redirect, url_for
import os
from os.path import join, dirname, realpath
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import load_model
from sklearn.preprocessing import StandardScaler
import numpy as np
import random
random.seed(21)
import warnings
warnings.filterwarnings('ignore')
pd.options.mode.chained_assignment = None
pd.options.display.float_format = '{:.2f}'.format
pd.set_option('display.max_columns', 200)
pd.set_option('display.width', 400)

app = Flask(__name__)

app.config["DEBUG"] = True

UPLOAD_FOLDER = 'Files'
app.config['UPLOAD_FOLDER'] =  UPLOAD_FOLDER

labels = ['Normal beat','Supraventricular premature beat','Premature ventricular contraction',
        'Fusion of ventricular and normal beat','Unclassifiable beat']

dfbase = pd.read_csv('mitbih_train.csv', header = None)
dfbase[187] = dfbase[187].astype('int64')
Y = dfbase[187]
X = dfbase.drop(187, axis = 1)
scaler = StandardScaler().fit(X)
X = scaler.transform(X)

model = load_model('model.h5')

@app.route("/", methods=['GET', 'POST'])
def index():
        if request.method == 'GET':
                return render_template('views/submit.ejs')

        if request.method == 'POST':
                uploaded_file = request.files['file']

                if uploaded_file.filename != '':
                        file_path = os.path.join(app.config['UPLOAD_FOLDER'], uploaded_file.filename)
                        uploaded_file.save(file_path)

                        df = pd.read_csv(file_path, header = None)

                        df[187] = df[187].astype('int64')
                        y = df[187]
                        x = df.drop(187, axis = 1)

                        x = scaler.transform(x)
                        # print(x)

                        ver = np.zeros((1, 5))

                        k = int(y[0])
                        ver[0][k] = 1

                        x = np.expand_dims(x, 2)

                        ind = 0

                        row = np.reshape(x[ind], (1, 187))
                        x_use = pd.DataFrame(row)

                        prediction = model.predict(x_use)
                        ret = np.argmax(prediction)

                        print(labels[ret])

                return render_template('views/submit.ejs', result = labels[ret])

if (__name__ == "__main__"):
     app1.run(port = 3000)
