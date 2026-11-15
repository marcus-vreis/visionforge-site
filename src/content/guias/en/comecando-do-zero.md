# Starting from zero

For people who have never trained a model. You do not need to program or know
the field to reach the end of this page: it explains what a training does, what
each screen asks for and what the numbers in the result mean.

The same content is inside the interface, with animated figures: the **guide**
button, in the header, option **Starting from zero**.

![The Starting from zero screen open in the interface](../images/vf-learn.png)

If you already train models and only want to learn VisionForge, go to
[I already train models](ja-treino-modelos.md).

## 1. What training a model is

A computer vision model is a program that receives an image and returns an
answer: which class it belongs to, where the objects are, how much a measure is
worth. Nobody writes the rules of that answer. The model starts with millions
of adjustable numbers, the weights, and learns the rules from examples.

Training is repeating three steps:

1. the model sees some images and risks an answer;
2. a calculation, the loss function, measures the size of the error;
3. the error goes back through the model and corrects each weight a little.

After thousands of repetitions, the answers get better.

| Term | In one line |
| --- | --- |
| weight | one of the numbers training adjusts; a model has millions |
| loss | the size of the error on a batch of images; training tries to reduce it |
| gradient | the direction in which each weight must change for the error to fall |

## 2. The data: examples with the right answer

To classify, the dataset is a folder with one subfolder per class: the images
of each class sit in the subfolder that carries its name. That is how
VisionForge knows the right answer for each image.

The images are divided into three parts that never mix:

| Part | What it is for | A common division |
| --- | --- | --- |
| training | it is what the model studies | 70% |
| validation | a test at the end of each epoch, to see whether it is learning | 15% |
| test | the final exam, with images it has never seen, used only once | 15% |

In the **Data** step you point to the folder, and VisionForge shows the
divisions and the classes it found. If you have no images yet, the **use the
sample dataset** button creates a small set for the first training.

![Data step with the sample dataset loaded](../images/vf-classification.png)

| Term | In one line |
| --- | --- |
| dataset | the set of images, with the right answer for each one |
| class | one of the possible answers, such as "cat" or "defect" |
| split | each of the parts: training, validation and test |

## 3. Epochs, batches and learning rate

The model does not see all the images at once. It receives one batch at a
time, for example 32 images, corrects the weights and moves on to the next
batch. When all the training batches have passed, an epoch has ended. A
training has several epochs: the model sees the same images again and makes
fewer mistakes each time round.

The learning rate is the size of each correction, and it is the number that
changes the result the most. Too small, training moves slowly. Too large, the
corrections overshoot and the error does not settle.

In the **Training** step these fields come first: epochs, batch size and
learning rate. The others already come with values that work and stay folded
under **advanced**.

| Term | In one line |
| --- | --- |
| batch | the images the model sees before each correction |
| epoch | one complete pass over the training images |
| learning rate | the size of each correction to the weights |

## 4. Reading the curves: learning or memorizing

During training VisionForge draws the loss of each epoch as two curves: the
training one and the validation one. Both should fall.

![The curves chapter on the Starting from zero screen](../images/vf-learn-curves.png)

The figure above is illustrative: the numbers do not come from a training. In
the interface you change the learning rate and see the three cases:

| Rate | What the curves do |
| --- | --- |
| low | both fall, but slowly; the epochs run out before the model learns |
| adequate | the error falls fast; at some point validation rises again while training keeps falling |
| high | the error jumps from side to side and does not settle |

When validation rises and training keeps falling, the model has started to
memorize the training images. This is called overfitting. That is what
validation is for: it shows the moment when studying more stops helping.
VisionForge keeps the weights of the best epoch on validation, not those of the
last one.

| Term | In one line |
| --- | --- |
| overfitting | the model memorizes the training set and gets worse on images it has not seen |
| best epoch | the one with the lowest validation loss; its weights are the ones kept |

## 5. The result: how much the model gets right

When training ends, the model is measured on the test set. Accuracy is the
fraction of images it got right. The confusion matrix opens that number up:
each row is the true class and each column is the class the model answered.

A made-up example, with 60 test images of three classes:

| True ↓ / predicted → | A | B | C |
| --- | --- | --- | --- |
| **A** | **18** | 1 | 1 |
| **B** | 2 | **16** | 2 |
| **C** | 0 | 3 | **17** |

The diagonal holds the correct answers: 18 + 16 + 17 = 51 out of 60, an
accuracy of 85%. Outside it, each cell says which class was confused with
which: class B was confused with C twice and with A another two times.

A number on its own may be luck. Training starts from randomly drawn weights,
and the seed fixes that draw. Changing the seed changes the result a little. To
know how much, the **Replicates** strategy repeats the training with several
seeds and gives the mean with a confidence interval
([Strategies](../gui/estrategias.md)).

Each task has its own metric: accuracy in classification, mAP in detection,
mIoU in segmentation, R² in regression and AUROC in anomaly. The idea is always
the same: measure on images the model has not seen.

![Result of a run in History](../images/vf-results.png)

| Term | In one line |
| --- | --- |
| accuracy | the fraction of images the model got right |
| seed | the number that fixes the random draws of training, so it can be repeated |
| metric | the calculation that summarizes the result; each task has its own |

## 6. Watch a training happen

The recording shows a real training of eight epochs on the sample dataset, on
the CPU, from the Review step to the result. The bar advances with each epoch,
the log shows the loss falling, and at the end the result opens in History. The
recording skips the intervals between frames.

![Recording of an eight-epoch training, from the click on Train to the result](../images/vf-training-film.gif)

The next step is to do your own. In the interface, the **First training** guide
follows each click on the screen itself, with the sample dataset. The text
version is in [First training](../gui/primeiro-treino.md).

## 7. What runs underneath

VisionForge has no hidden training of its own: it organizes open libraries the
whole field uses, and the **Live code** tab shows the code that is running
([Code tab](../gui/codigo.md)). Each one is worth knowing by name.

| Library | What it does here |
| --- | --- |
| [PyTorch](https://pytorch.org/) | the neural network library every model is trained in |
| [torchvision](https://docs.pytorch.org/vision/stable/) | ready-made architectures, pretrained weights and image transformations |
| [timm](https://huggingface.co/docs/timm) | hundreds of further architectures, chosen by name |
| [Ultralytics](https://docs.ultralytics.com/) | YOLO and RT-DETR for object detection; it is optional and installed separately |
| [scikit-learn](https://scikit-learn.org/stable/) | the metrics of the result and the K-fold split |
| [Optuna](https://optuna.org/) | the guided hyperparameter search |
| [ONNX Runtime](https://onnxruntime.ai/) | runs the model exported to ONNX, outside PyTorch |
| [FastAPI](https://fastapi.tiangolo.com/) | the local server the interface talks to |
| [React](https://react.dev/) | the interface |
| [Pydantic](https://docs.pydantic.dev/) | checks the configuration before training starts |

## 8. To learn more

This page gives the vocabulary. To really understand the field, these
materials are free and widely used in courses.

| Material | What it is | Language |
| --- | --- | --- |
| [Dive into Deep Learning](https://pt.d2l.ai/) | open book with theory and code side by side | Portuguese |
| [Machine Learning Crash Course](https://developers.google.com/machine-learning/crash-course?hl=pt-br) | Google's introductory course, with exercises | Portuguese |
| [3Blue1Brown: Neural networks](https://www.3blue1brown.com/topics/neural-networks) | videos with animations of how a neural network learns | English |
| [Practical Deep Learning](https://course.fast.ai/) | hands-on course: you train a model in the very first lesson | English |
| [CS231n](https://cs231n.stanford.edu/) | the Stanford course on neural networks for computer vision | English |
| [PyTorch Tutorials](https://docs.pytorch.org/tutorials/) | the official PyTorch tutorials | English |
| [Deep Learning](https://www.deeplearningbook.org/) | the textbook of the field, by Goodfellow, Bengio and Courville, with the mathematics behind it | English |

In the VisionForge documentation:

- [First training](../gui/primeiro-treino.md), step by step;
- [Strategies](../gui/estrategias.md): when to use K-fold, search, replicates
  and comparison;
- [After training](../gui/depois-do-treino.md): what to do with the result;
- [Datasets in the interface](../gui/datasets.md): explore, audit and re-split;
- [What VisionForge does](o-que-o-visionforge-faz.md): every feature, with the
  screen of each one;
- [Interface guides](../gui/README.md): the index of all pages.
